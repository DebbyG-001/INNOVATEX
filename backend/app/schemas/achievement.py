from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class AchievementBase(BaseModel):
    name: str
    description: Optional[str] = None
    criteria: Dict[str, Any]

class AchievementResponse(AchievementBase):
    id: str

    class Config:
        from_attributes = True

class UserAchievementResponse(BaseModel):
    id: str
    user_id: str
    achievement_id: str
    unlocked_at: datetime
    achievement: AchievementResponse

    class Config:
        from_attributes = True
