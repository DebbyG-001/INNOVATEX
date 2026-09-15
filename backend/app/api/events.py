from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.event import EventCreate, EventProcessResult
from app.services.event_service import process_event

router = APIRouter(prefix="/events", tags=["events"])

@router.post("", response_model=EventProcessResult, status_code=status.HTTP_202_ACCEPTED)
def ingest_event(event_in: EventCreate, db: Session = Depends(get_db)):
    """
    Ingest a simulated banking event. 
    In a real system, this endpoint would be authenticated via an API key 
    from the banking core or webhook provider.
    """
    result = process_event(db, event_in)
    return result
