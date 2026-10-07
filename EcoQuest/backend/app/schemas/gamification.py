import datetime
from typing import Optional
from pydantic import BaseModel


class XPResponse(BaseModel):
    xp: int
    points: int
    level_index: int
    level_name: str
    streak_days: int

    class Config:
        from_attributes = True


class AchievementResponse(BaseModel):
    id: int
    code: str
    name: str
    description: str
    xp_reward: int
    icon_name: str
    completed: bool = False
    completed_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class ChallengeResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    category: str
    current_progress: float
    target_progress: float
    unit: str
    xp_reward: int
    points_reward: int
    status: str
    is_first_mission: bool = False

    class Config:
        from_attributes = True

class RewardResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    points_cost: int
    category: str
    value_display: str

    class Config:
        from_attributes = True

class RewardRedemptionResponse(BaseModel):
    id: int
    reward_id: int
    reward_title: str
    points_spent: int
    timestamp: datetime.datetime
    status: str
    code: str

    class Config:
        from_attributes = True
