from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models.models import User, FinancialGoal, FraudEvent
from app.schemas.openapi import AdminDashboardResponse, FraudEventResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges")
    return current_user

@router.get("/dashboard", response_model=AdminDashboardResponse, summary="Admin KPI overview and metrics")
def get_admin_dashboard(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_goals_count = db.query(FinancialGoal).filter(FinancialGoal.status.in_(["active", "in_progress"])).count()
    
    # Calculate total points distributed by summing up all user points.
    total_points_distributed = db.query(func.sum(User.points)).scalar() or 0
    
    return AdminDashboardResponse(
        total_users=total_users,
        active_goals_count=active_goals_count,
        total_points_distributed=int(total_points_distributed)
    )

@router.get("/fraud-events", response_model=List[FraudEventResponse], summary="List flagged fraudulent transactions")
def list_fraud_events(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    events = db.query(FraudEvent).all()
    return [
        FraudEventResponse(
            event_id=e.event_id,
            user_id=e.user_id,
            risk_score=e.risk_score,
            reason=e.reason
        ) for e in events
    ]
