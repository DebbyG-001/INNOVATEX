from sqlalchemy.orm import Session
from app.models.models import User, Achievement, UserAchievement
from datetime import datetime, timezone

def check_and_award_achievements(db: Session, user: User):
    all_achievements = db.query(Achievement).all()
    user_achievements = {ua.achievement_id: ua for ua in user.achievements}
    
    awarded_any = False
    
    for ach in all_achievements:
        if ach.id in user_achievements:
            continue # already unlocked
            
        criteria = ach.criteria
        unlock = False
        
        if criteria.get("type") == "streak_days":
            if user.streak_count >= criteria.get("count", 1):
                unlock = True
        elif criteria.get("type") == "mission_count":
            completed_missions = sum(1 for m in user.missions if m.status == "completed")
            if completed_missions >= criteria.get("count", 1):
                unlock = True
                
        if unlock:
            new_ua = UserAchievement(
                user_id=user.id,
                achievement_id=ach.id,
                unlocked_at=datetime.now(timezone.utc)
            )
            db.add(new_ua)
            awarded_any = True
            
    if awarded_any:
        db.commit()
