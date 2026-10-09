from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class BillBase(BaseModel):
    title: str
    category: str
    amount: float
    due_date: datetime
    recurrence: str

class BillCreate(BillBase):
    pass

class BillResponse(BillBase):
    id: int
    user_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
