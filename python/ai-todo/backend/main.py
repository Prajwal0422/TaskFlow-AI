import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import json
from dotenv import load_dotenv
from typing import Optional, List
from datetime import datetime
import numpy as np
from preprocess import get_bert_embedding, get_tfidf_embedding
from scheduler import scheduler, schedule_reminder, update_user_embedding

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# MongoDB setup (adjust URI for Atlas if needed)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["taskflow_ai"]
tasks_collection = db["tasks"]
users_collection = db["users"]
reminders_collection = db["reminders"]

app = FastAPI(title="TaskFlow AI Backend")

# Allow CORS from local dev and deployed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AddTask(BaseModel):
    user_id: str
    task: str
    due_date: str | None = None
    reminders: list | None = None
    recurrence: str | None = None
    estimated_minutes: int | None = None
    
    @validator('task')
    def task_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Task cannot be empty')
        return v.strip()

class EditTask(BaseModel):
    id: str
    user_id: str
    task: str
    due_date: str | None = None
    reminders: list | None = None
    recurrence: str | None = None
    estimated_minutes: int | None = None
    completed: bool
    status: str | None = None
    
    @validator('task')
    def task_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Task cannot be empty')
        return v.strip()
    
    @validator('id')
    def id_must_be_valid(cls, v):
        if not v:
            raise ValueError('Task ID is required')
        return v

class DeleteTask(BaseModel):
    id: str

class TasksList(BaseModel):
    tasks: list
    user_input: str | None = "What should I do next?"

# New models for enhanced functionality
class User(BaseModel):
    id: str
    name: str
    timezone: str
    notification_methods: dict
    behavior_stats: dict
    user_embedding: list | None = None
    created_at: str

class AISuggestionRequest(BaseModel):
    tasks: List[dict]
    user_stats: dict
    now: str
    timezone: str
    user_input: str | None = "What should I do next?"

class ScheduleReminder(BaseModel):
    reminder_iso: str
    user_id: str
    task_id: str
    title: str
    body: str

def doc_to_task(doc):
    return {
        "id": str(doc["_id"]),
        "task": doc.get("task"),
        "category": doc.get("category"),
        "priority": doc.get("priority"),
        "completed": doc.get("completed", False),
        "due_date": doc.get("due_date"),
        "user_id": doc.get("user_id"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
        "reminders": doc.get("reminders", []),
        "recurrence": doc.get("recurrence"),
        "estimated_minutes": doc.get("estimated_minutes"),
        "status": doc.get("status", "pending"),
        "snooze_count": doc.get("snooze_count", 0),
        "last_ai_score": doc.get("last_ai_score")
    }

@app.get("/")
def root():
    return {"message": "TaskFlow AI Backend running"}

@app.get("/tasks")
def get_tasks():
    docs = list(tasks_collection.find({}))
    return [doc_to_task(d) for d in docs]

@app.post("/add-task")
def add_task(payload: AddTask):
    now = datetime.utcnow().isoformat()
    doc = {
        "user_id": payload.user_id,
        "task": payload.task,
        "due_date": payload.due_date,
        "reminders": payload.reminders or [],
        "recurrence": payload.recurrence,
        "estimated_minutes": payload.estimated_minutes,
        "created_at": now,
        "updated_at": now,
        "completed": False,
        "category": None,
        "priority": None,
        "status": "pending",
        "snooze_count": 0,
        "last_ai_score": None
    }
    result = tasks_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    # Compute embeddings
    try:
        doc["bert_vector"] = get_bert_embedding(payload.task)
        doc["tfidf_vector"] = get_tfidf_embedding(payload.task)
        # Update the document with embeddings
        tasks_collection.update_one(
            {"_id": doc["_id"]}, 
            {"$set": {"bert_vector": doc["bert_vector"], "tfidf_vector": doc["tfidf_vector"]}}
        )
        
        # Update user embedding for personalization
        update_user_embedding(payload.user_id, doc["bert_vector"])
    except Exception as e:
        print(f"Error computing embeddings: {e}")
        # Continue without embeddings if there's an error
        pass
    
    # Schedule reminders if provided
    if payload.reminders:
        for reminder_time in payload.reminders:
            schedule_reminder(reminder_time, payload.user_id, str(doc["_id"]), payload.task, f"Reminder for: {payload.task}")
    
    return {"task": doc_to_task(doc)}

@app.post("/edit-task")
def edit_task(payload: EditTask):
    try:
        obj_id = ObjectId(payload.id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    # Validate task text
    if not payload.task or not payload.task.strip():
        raise HTTPException(status_code=400, detail="Task cannot be empty")
    
    # Prepare update data
    update_data = {
        "task": payload.task.strip(),
        "due_date": payload.due_date,
        "reminders": payload.reminders or [],
        "recurrence": payload.recurrence,
        "estimated_minutes": payload.estimated_minutes,
        "completed": payload.completed,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Add status if provided
    if payload.status:
        update_data["status"] = payload.status
    
    # Update the task
    result = tasks_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Recompute embeddings for updated task
    try:
        updated_bert_vector = get_bert_embedding(payload.task.strip())
        updated_tfidf_vector = get_tfidf_embedding(payload.task.strip())
        tasks_collection.update_one(
            {"_id": obj_id},
            {"$set": {"bert_vector": updated_bert_vector, "tfidf_vector": updated_tfidf_vector}}
        )
        
        # Update user embedding for personalization
        update_user_embedding(payload.user_id, updated_bert_vector)
    except Exception as e:
        print(f"Error updating embeddings: {e}")
        # Continue without updating embeddings if there's an error
        pass
    
    # Schedule reminders if provided
    if payload.reminders:
        for reminder_time in payload.reminders:
            schedule_reminder(reminder_time, payload.user_id, payload.id, payload.task, f"Reminder for: {payload.task}")
    
    # Fetch updated task
    updated_doc = tasks_collection.find_one({"_id": obj_id})
    return {"task": doc_to_task(updated_doc)}

@app.post("/delete-task")
def delete_task(payload: DeleteTask):
    try:
        obj_id = ObjectId(payload.id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    result = tasks_collection.delete_one({"_id": obj_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted"}

@app.post("/ai-suggest")
def ai_suggest(payload: AISuggestionRequest):
    # Check if Google API key is configured
    if not GOOGLE_API_KEY or GOOGLE_API_KEY == "your_actual_google_api_key_here":
        raise HTTPException(
            status_code=500, 
            detail="Google API key not configured. Please set your API key in the .env file."
        )
    
    tasks = payload.tasks or []
    user_input = payload.user_input or "What should I do next?"
    user_stats = payload.user_stats or {}
    now = payload.now or datetime.utcnow().isoformat()
    timezone = payload.timezone or "UTC"

    prompt = f"""
    You are an assistant that MUST output strict JSON only (no extra commentary).
    Input contains:
    {{
      "tasks": {tasks},
      "user_stats": {user_stats},
      "now": "{now}",
      "timezone": "{timezone}",
      "user_input": "{user_input}"
    }}
    You must output valid JSON with these keys:
    - categorized: array of objects {{"task": "...", "category": "Work|Personal|Health|Study|Finance|Home|Errand|Other", "priority":"High|Medium|Low", "score": 0-1}}
    - schedule_plan: array of objects {{"task":"...", "start_iso":"2025-11-14T09:00:00Z", "end_iso":"...", "reason":"..."}}
    - reminder_recs: array of objects {{"task":"...", "reminder_iso":"...", "method":"push|email|in-app"}}
    - explanation: short string (1-2 sentences) summarizing the approach
    
    Constraints:
    - Use user's timezone for scheduling and return ISO UTC times.
    - Prioritize tasks with closer due_date, higher historical completion urgency, and shorter estimated duration if user prefers quick wins.
    - Output only valid JSON with no extra text.
    - Make sure your response starts with '{{' and ends with '}}'.
    - Do not include any markdown formatting or code blocks.
    - Keep your response short and concise.
    - If you cannot generate a response, return an empty JSON object {{}}.
    """

    try:
        # Use Google Generative AI instead of OpenAI
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.0,
                max_output_tokens=800
            )
        )
        
        # Check if response has content
        if not response:
            raise Exception("Empty response from Google Generative AI")
            
        # For simplicity, just get the text directly
        try:
            text = response.text.strip()
            print(f"AI Response: {text}")  # Debug line to see what the model returns
            
            # Handle completely empty responses
            if not text or text.strip() == "":
                print("Empty response from AI, providing default suggestions")
                raise ValueError("Empty response from AI")
        except Exception as e:
            # If we can't get the text or it's empty, return default suggestions
            print(f"Error getting AI response: {e}")
            return {
                "categorized": [
                    {"task": "Review and organize your tasks", "category": "Work", "priority": "High", "score": 0.8},
                    {"task": "Plan your day ahead", "category": "Personal", "priority": "Medium", "score": 0.7},
                    {"task": "Complete pending assignments", "category": "Study", "priority": "High", "score": 0.9}
                ],
                "schedule_plan": [
                    {"task": "Review and organize your tasks", "start_iso": "2025-11-28T09:00:00Z", "end_iso": "2025-11-28T09:30:00Z", "reason": "Start with organizing your tasks for better productivity"},
                    {"task": "Plan your day ahead", "start_iso": "2025-11-28T10:00:00Z", "end_iso": "2025-11-28T10:15:00Z", "reason": "Planning helps you stay focused and productive"}
                ],
                "reminder_recs": [
                    {"task": "Review and organize your tasks", "reminder_iso": "2025-11-28T08:30:00Z", "method": "in-app"}
                ],
                "explanation": "These are default suggestions to help you get started. Add more specific tasks for personalized AI recommendations."
            }

        # Try to parse the JSON even if the model added backticks or codeblock markers
        try:
            # strip code fences if present
            if text.startswith("```"):
                # remove fences
                text = "\n".join(text.splitlines()[1:-1])
            
            # Handle completely empty responses
            if not text or text.strip() == "":
                raise ValueError("Empty response from AI")
                
            parsed = json.loads(text)
            
            # Check if the parsed response has meaningful content
            if not parsed or (not parsed.get("categorized") and not parsed.get("schedule_plan") and not parsed.get("reminder_recs")):
                raise ValueError("Empty or incomplete response from AI")
                
        except Exception:
            # fallback: try to be forgiving by finding first '{' and last '}'
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                parsed_text = text[start:end+1]
                if parsed_text and parsed_text != "{}":
                    parsed = json.loads(parsed_text)
                else:
                    # Provide default suggestions when AI fails
                    return {
                        "categorized": [
                            {"task": "Review and organize your tasks", "category": "Work", "priority": "High", "score": 0.8},
                            {"task": "Plan your day ahead", "category": "Personal", "priority": "Medium", "score": 0.7},
                            {"task": "Complete pending assignments", "category": "Study", "priority": "High", "score": 0.9}
                        ],
                        "schedule_plan": [
                            {"task": "Review and organize your tasks", "start_iso": "2025-11-28T09:00:00Z", "end_iso": "2025-11-28T09:30:00Z", "reason": "Start with organizing your tasks for better productivity"},
                            {"task": "Plan your day ahead", "start_iso": "2025-11-28T10:00:00Z", "end_iso": "2025-11-28T10:15:00Z", "reason": "Planning helps you stay focused and productive"}
                        ],
                        "reminder_recs": [
                            {"task": "Review and organize your tasks", "reminder_iso": "2025-11-28T08:30:00Z", "method": "in-app"}
                        ],
                        "explanation": "These are default suggestions to help you get started. Add more specific tasks for personalized AI recommendations."
                    }
            else:
                # Provide default suggestions when AI fails
                return {
                    "categorized": [
                        {"task": "Review and organize your tasks", "category": "Work", "priority": "High", "score": 0.8},
                        {"task": "Plan your day ahead", "category": "Personal", "priority": "Medium", "score": 0.7},
                        {"task": "Complete pending assignments", "category": "Study", "priority": "High", "score": 0.9}
                    ],
                    "schedule_plan": [
                        {"task": "Review and organize your tasks", "start_iso": "2025-11-28T09:00:00Z", "end_iso": "2025-11-28T09:30:00Z", "reason": "Start with organizing your tasks for better productivity"},
                        {"task": "Plan your day ahead", "start_iso": "2025-11-28T10:00:00Z", "end_iso": "2025-11-28T10:15:00Z", "reason": "Planning helps you stay focused and productive"}
                    ],
                    "reminder_recs": [
                        {"task": "Review and organize your tasks", "reminder_iso": "2025-11-28T08:30:00Z", "method": "in-app"}
                    ],
                    "explanation": "These are default suggestions to help you get started. Add more specific tasks for personalized AI recommendations."
                }

        # Update tasks in DB with category/priority and scores
        for item in parsed.get("categorized", []):
            # find the task doc and update category/priority/score
            tasks_collection.update_one(
                {"task": item["task"]},
                {"$set": {
                    "category": item.get("category"), 
                    "priority": item.get("priority"),
                    "last_ai_score": item.get("score")
                }}
            )
        
        # Schedule recommended reminders
        for reminder in parsed.get("reminder_recs", []):
            schedule_reminder(
                reminder["reminder_iso"], 
                reminder.get("user_id", "default"), 
                reminder.get("task_id", "default"), 
                reminder.get("task", "Reminder"), 
                f"Reminder for: {reminder.get('task', 'Task')}"
            )

        return parsed

    except Exception as e:
        # Check if it's a quota error
        error_message = str(e)
        if "insufficient_quota" in error_message or "429" in error_message:
            raise HTTPException(
                status_code=429, 
                detail="Google API quota exceeded. Please check your plan and billing details"
            )
        else:
            raise HTTPException(status_code=500, detail=f"AI or parsing error: {str(e)}")

@app.get("/user/{user_id}")
def get_user(user_id: str):
    """Get user profile"""
    user_doc = users_collection.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert ObjectId to string for JSON serialization
    user_doc["id"] = str(user_doc["_id"])
    del user_doc["_id"]
    return user_doc

@app.post("/user")
def create_user(user: User):
    """Create a new user profile"""
    user_dict = user.dict()
    user_dict["_id"] = user_dict.pop("id")
    
    result = users_collection.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    del user_dict["_id"]
    
    return user_dict

if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run(app, host="0.0.0.0", port=8002)
    except KeyboardInterrupt:
        scheduler.shutdown()
        print("Scheduler shutdown complete")