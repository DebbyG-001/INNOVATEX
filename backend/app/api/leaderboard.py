from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.models import User
from app.services.points_service import calculate_balance
from app.services.level_service import get_level_info

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/", response_model=List[Dict[str, Any]])
def get_leaderboard(db: Session = Depends(get_db), limit: int = 10):
    users = db.query(User).order_by(desc(User.level), desc(User.streak_count)).limit(limit).all()
    
    leaderboard = []
    for user in users:
        balance = calculate_balance(db, user.id)
        level_info = get_level_info(balance)
        
        leaderboard.append({
            "user_id": user.id,
            "name": user.name,
            "level": user.level,
            "level_name": level_info["name"],
            "points": balance,
            "streak_count": user.streak_count
        })
        
    # Sort leaderboard primarily by points instead of just level for more granularity
    leaderboard.sort(key=lambda x: x["points"], reverse=True)
    
    return leaderboard[:limit]
