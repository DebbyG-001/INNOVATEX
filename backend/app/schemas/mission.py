from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel

class MissionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str
    criteria: dict
    reward_points: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_completions: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserMissionResponse(BaseModel):
    id: str
    user_id: str
    mission_id: str
    progress: dict
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    completion_count: int
    
    mission: MissionResponse

    class Config:
        from_attributes = True
