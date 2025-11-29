from pydantic import BaseModel
from typing import Optional, List

class Task(BaseModel):
    user_id: str
    task: str
    due_date: Optional[str] = None
    reminders: Optional[List[str]] = []
    recurrence: Optional[str] = None
    estimated_minutes: Optional[int] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: str = "pending"
    completion_time_minutes: Optional[int] = None
    snooze_count: int = 0
    last_ai_score: Optional[float] = None