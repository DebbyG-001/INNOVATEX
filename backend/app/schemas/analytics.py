from pydantic import BaseModel
from typing import Dict, Any

class AnalyticsResponse(BaseModel):
    total_users: int
    dau: int  # Daily Active Users
    total_missions_completed: int
    total_points_awarded: int
    total_points_redeemed: int
    abuse_events_flagged: int

    class Config:
        from_attributes = True
