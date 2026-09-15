from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics import get_analytics_dashboard
# For an actual app, you'd protect this with an admin dependency, but we'll leave it accessible for MVP

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    return get_analytics_dashboard(db)
