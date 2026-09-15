from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app.models.models import User, UserMission, PointsLedger, Event

def get_analytics_dashboard(db: Session) -> dict:
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    dau = db.query(func.count(User.id)).filter(User.last_activity_date >= today).scalar() or 0
    
    total_missions_completed = db.query(func.count(UserMission.id)).filter(UserMission.status == "completed").scalar() or 0
    
    total_points_awarded = db.query(func.sum(PointsLedger.points)).filter(PointsLedger.points > 0).scalar() or 0
    
    total_points_redeemed = db.query(func.sum(PointsLedger.points)).filter(PointsLedger.points < 0).scalar() or 0
    total_points_redeemed = abs(total_points_redeemed)
    
    abuse_events_flagged = db.query(func.count(Event.id)).filter(Event.status == "rejected").scalar() or 0
    
    return {
        "total_users": total_users,
        "dau": dau,
        "total_missions_completed": total_missions_completed,
        "total_points_awarded": total_points_awarded,
        "total_points_redeemed": total_points_redeemed,
        "abuse_events_flagged": abuse_events_flagged
    }
