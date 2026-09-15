from sqlalchemy.orm import Session
from app.models.models import Event

def calculate_risk_score(db: Session, event: Event) -> int:
    from datetime import datetime, timezone, timedelta
    
    risk = 0
    now = datetime.now(timezone.utc)
    one_minute_ago = now - timedelta(minutes=1)
    
    # Check for rapid repeated transactions
    recent_similar_events = db.query(Event).filter(
        Event.user_id == event.user_id,
        Event.amount == event.amount,
        Event.created_at >= one_minute_ago
    ).count()
    
    if recent_similar_events >= 5:
        risk += 80
        
    return risk
