from typing import Optional
from pydantic import BaseModel


class AccountResponse(BaseModel):
    id: int
    name: str
    account_type: str
    bank: str
    account_number: str
    balance: float

    class Config:
        from_attributes = True


class AddFundsRequest(BaseModel):
    account_id: int
    amount: float
