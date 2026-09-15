from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.models.models import User, Event

def update_streak(db: Session, user: User, event: Event):
    now = datetime.now(timezone.utc)
    
    # Simple logic for MVP: if this is the first event, streak is 1.
    # If the last activity was yesterday, streak + 1.
    # If it was earlier than yesterday, streak resets to 1 (unless protected).
    # If it was today, streak remains the same.
    
    if user.last_activity_date is None:
        user.streak_count = 1
    else:
        # ensuring last_activity_date is timezone aware
        last_date = user.last_activity_date
        if last_date.tzinfo is None:
            last_date = last_date.replace(tzinfo=timezone.utc)
            
        delta_days = (now.date() - last_date.date()).days
        
        if delta_days == 1:
            user.streak_count += 1
        elif delta_days > 1:
            # Streak broken!
            # Could check for streak_shield here
            user.streak_count = 1
        elif delta_days == 0:
            pass # Same day, streak doesn't increase but doesn't break
            
    user.last_activity_date = now
    db.commit()
    db.refresh(user)
