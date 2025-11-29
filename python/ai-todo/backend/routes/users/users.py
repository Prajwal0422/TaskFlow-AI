from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
from bson.objectid import ObjectId
from database import users_collection

router = APIRouter()

class User(BaseModel):
    id: str
    name: str
    timezone: str
    notification_methods: dict
    behavior_stats: dict
    user_embedding: Optional[list] = None
    created_at: str

@router.get("/{user_id}")
def get_user(user_id: str):
    """Get user profile"""
    user_doc = users_collection.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert ObjectId to string for JSON serialization
    user_doc["id"] = str(user_doc["_id"])
    del user_doc["_id"]
    return user_doc

@router.post("/")
def create_user(user: User):
    """Create a new user profile"""
    user_dict = user.dict()
    user_dict["_id"] = user_dict.pop("id")
    
    result = users_collection.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    del user_dict["_id"]
    
    return user_dict

@router.put("/{user_id}")
def update_user(user_id: str, user: User):
    """Update user profile"""
    user_dict = user.dict()
    user_dict["_id"] = user_id
    
    result = users_collection.update_one(
        {"_id": user_id},
        {"$set": user_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_dict["id"] = user_id
    del user_dict["_id"]
    
    return user_dict