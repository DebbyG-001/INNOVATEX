from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class RewardResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    points_required: int
    stock: int
    created_at: datetime

    class Config:
        from_attributes = True

class RedemptionResponse(BaseModel):
    id: str
    user_id: str
    reward_id: str
    status: str
    redeemed_at: datetime
    
    reward: RewardResponse

    class Config:
        from_attributes = True
