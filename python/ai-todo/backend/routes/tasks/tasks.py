from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from bson.objectid import ObjectId
import json
import numpy as np
from database import tasks_collection, users_collection, reminders_collection
from models.schemas import AddTask, EditTask, DeleteTask
from preprocess import get_bert_embedding, get_tfidf_embedding
from scheduler import schedule_reminder, update_user_embedding

router = APIRouter()

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

@router.get("/")
def get_tasks():
    docs = list(tasks_collection.find({}))
    return [doc_to_task(d) for d in docs]

@router.post("/add")
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

@router.post("/edit")
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

@router.post("/delete")
def delete_task(payload: DeleteTask):
    try:
        obj_id = ObjectId(payload.id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    result = tasks_collection.delete_one({"_id": obj_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted"}

@router.post("/completed")
def task_completed(payload: dict):
    task_id = payload.get("id")
    try:
        obj_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    # Update task status to completed
    result = tasks_collection.update_one(
        {"_id": obj_id},
        {"$set": {"completed": True, "status": "completed", "updated_at": datetime.utcnow().isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task marked as completed"}