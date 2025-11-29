from pydantic import BaseModel, validator
from typing import Optional, List

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