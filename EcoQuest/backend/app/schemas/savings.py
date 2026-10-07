import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SavingsCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    duration_months: int = Field(default=6, description="1, 2, 3, 4, 6, 9, 12, 18, 24, or 36 months")
    bank: str = "GTBank"


class SavingsUpdate(BaseModel):
    current_amount: Optional[float] = None
    target_amount: Optional[float] = None
    status: Optional[str] = None


class SavingsResponse(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    duration_months: int
    bank: str
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
