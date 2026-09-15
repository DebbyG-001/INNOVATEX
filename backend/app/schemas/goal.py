from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class GoalBase(BaseModel):
    name: str
    target_amount: float
    deadline: Optional[datetime] = None

class GoalCreate(GoalBase):
    current_amount: Optional[float] = 0.0

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None

class GoalResponse(GoalBase):
    id: str
    user_id: str
    current_amount: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
