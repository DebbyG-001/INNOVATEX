from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel

class EventBase(BaseModel):
    event_id: str
    user_id: str
    event_type: str
    event_reference: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    timestamp: datetime
    metadata_json: Optional[dict] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: str
    user_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class EventProcessResult(BaseModel):
    status: str
    points_awarded: int
    risk_score: Optional[int] = 0
