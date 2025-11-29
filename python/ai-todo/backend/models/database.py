from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel

class TaskModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    task: str
    category: Optional[str] = None
    priority: Optional[str] = None
    completed: bool = False
    due_date: Optional[str] = None
    created_at: str
    updated_at: str
    reminders: List[str] = []
    recurrence: Optional[str] = None
    estimated_minutes: Optional[int] = None
    status: str = "pending"
    snooze_count: int = 0
    last_ai_score: Optional[float] = None
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    bert_vector: Optional[List[float]] = None
    tfidf_vector: Optional[List[float]] = None

class UserModel(BaseModel):
    id: str
    name: str
    timezone: str
    notification_methods: Dict[str, bool]
    behavior_stats: Dict[str, float]
    user_embedding: Optional[List[float]] = None
    created_at: str

class ReminderModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    task_id: str
    title: str
    body: str
    reminder_time: str
    method: str
    sent: bool = False
    sent_at: Optional[str] = None

class NotificationModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    body: str
    type: str
    created_at: str
    read: bool = False
    read_at: Optional[str] = None