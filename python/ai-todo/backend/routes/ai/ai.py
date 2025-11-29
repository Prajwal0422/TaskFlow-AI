from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import json
import google.generativeai as genai
import os
from database import tasks_collection, users_collection, reminders_collection
from scheduler import schedule_reminder

router = APIRouter()

class AISuggestionRequest(BaseModel):
    tasks: List[dict]
    user_stats: dict
    now: str
    timezone: str
    user_input: str | None = "What should I do next?"

class SchedulePlan(BaseModel):
    task: str
    start_iso: str
    end_iso: str
    reason: str

class ReminderRec(BaseModel):
    task: str
    reminder_iso: str
    method: str

class CategorizedTask(BaseModel):
    task: str
    category: str
    priority: str
    score: float

class AISuggestionResponse(BaseModel):
    categorized: List[CategorizedTask]
    schedule_plan: List[SchedulePlan]
    reminder_recs: List[ReminderRec]
    explanation: str

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize the Google Generative AI client
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

@router.post("/suggest")
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

    prompt = """
You are an assistant that MUST output strict JSON only (no extra commentary).
Input contains:
{
  "tasks": """ + json.dumps(tasks) + """,
  "user_stats": """ + json.dumps(user_stats) + """,
  "now": \"""" + now + """\",
  "timezone": \"""" + timezone + """\",
  "user_input": \"""" + user_input + """\"
}
You must output JSON with these keys:
- categorized: array of objects {"task": "...", "category": "Work|Personal|Health|Study|Finance|Home|Errand|Other", "priority":"High|Medium|Low", "score": 0-1}
- schedule_plan: array of objects {"task":"...", "start_iso":"2025-11-14T09:00:00Z", "end_iso":"...", "reason":"..."}
- reminder_recs: array of objects {"task":"...", "reminder_iso":"...", "method":"push|email|in-app"}
- explanation: short string (1-2 sentences) summarizing the approach

Constraints:
- Use user's timezone for scheduling and return ISO UTC times.
- Prioritize tasks with closer due_date, higher historical completion urgency, and shorter estimated duration if user prefers quick wins.
- Output only JSON.
"""

    try:
        # Use Google Generative AI with a supported model
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            prompt,
            generation_config={'temperature': 0.0, 'max_output_tokens': 800}
        )
        
        # Check if response has content
        if not response or not response.text:
            raise Exception("Empty response from Google Generative AI")

        text = response.text.strip()

        # Try to parse the JSON even if the model added backticks or codeblock markers
        try:
            # strip code fences if present
            if text.startswith("```"):
                # remove fences
                text = "\n".join(text.splitlines()[1:-1])
            parsed = json.loads(text)
        except Exception:
            # fallback: try to be forgiving by finding first '{' and last '}'
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                parsed = json.loads(text[start:end+1])
            else:
                raise

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

@router.post("/apply-schedule")
def apply_schedule(payload: dict):
    """Apply AI-generated schedule to tasks"""
    schedule_plan = payload.get("schedule_plan", [])
    
    # Update tasks with schedule information
    for item in schedule_plan:
        tasks_collection.update_one(
            {"task": item["task"]},
            {"$set": {
                "scheduled_start": item["start_iso"],
                "scheduled_end": item["end_iso"]
            }}
        )
    
    return {"message": f"Applied schedule to {len(schedule_plan)} tasks"}