from pydantic import BaseModel
from typing import Optional, Dict, List

class User(BaseModel):
    id: str
    name: str
    timezone: str
    notification_methods: dict
    behavior_stats: dict
    user_embedding: Optional[list] = None
    created_at: str