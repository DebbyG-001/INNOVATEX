import datetime
from typing import Optional
from pydantic import BaseModel


class TransactionCreate(BaseModel):
    account_id: int
    action_type: str  # transfer, bill_payment, airtime, saving_transfer, funding
    amount: float
    description: str
    recipient: Optional[str] = None
    bank: Optional[str] = None
    goal_id: Optional[int] = None


class TransactionResponse(BaseModel):
    id: int
    account_id: int
    type: str
    action_type: str
    amount: float
    description: str
    recipient: Optional[str] = None
    reference: str
    status: str
    is_simulated: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class TransactionResult(BaseModel):
    transaction: TransactionResponse
    new_balance: float
    xp_awarded: int = 0
    points_awarded: int = 0
    first_payment_achievement_unlocked: bool = False
    message: str = "Transaction successful"
