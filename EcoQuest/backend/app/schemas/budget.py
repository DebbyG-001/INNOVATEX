from pydantic import BaseModel
from datetime import datetime

class BudgetBase(BaseModel):
    name: str
    limit_amount: float
    color: str = "bg-[#3B82F6]"

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: int
    created_at: datetime
    spent: float = 0.0

    class Config:
        from_attributes = True
