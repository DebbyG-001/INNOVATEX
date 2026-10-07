import datetime
from typing import Optional
from pydantic import BaseModel


class GoalCreate(BaseModel):
    name: str
    category: str = "education"
    target_amount: float
    current_amount: float = 0.0
    duration: int = 6  # months
    bank: str = "Access Bank"  # Nigerian bank option


class GoalUpdate(BaseModel):
    current_amount: Optional[float] = None
    target_amount: Optional[float] = None
    status: Optional[str] = None


class GoalResponse(BaseModel):
    id: int
    name: str
    category: str
    target_amount: float
    current_amount: float
    target_date: Optional[str] = None
    duration: int
    bank: str
    required_monthly: float
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
