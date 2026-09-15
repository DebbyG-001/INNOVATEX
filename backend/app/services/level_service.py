from sqlalchemy.orm import Session
from app.models.models import User

LEVEL_THRESHOLDS = [
    (7000, 5, "Master"),
    (3500, 4, "Champion"),
    (1500, 3, "Achiever"),
    (500, 2, "Builder"),
    (0, 1, "Starter")
]

def get_level_info(points: int):
    for threshold, level_id, name in LEVEL_THRESHOLDS:
        if points >= threshold:
            return {"level": level_id, "name": name, "threshold": threshold}
    return {"level": 1, "name": "Starter", "threshold": 0}

def update_user_level(db: Session, user: User, current_balance: int) -> int:
    level_info = get_level_info(current_balance)
    new_level = level_info["level"]
        
    if user.level != new_level:
        user.level = new_level
        db.commit()
        db.refresh(user)
    
    return user.level
