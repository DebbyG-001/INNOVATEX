from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import PointsLedger, User

def add_ledger_entry(db: Session, user_id: str, points: int, reason: str, event_id: str = None) -> PointsLedger:
    entry = PointsLedger(
        user_id=user_id,
        points=points,
        reason=reason,
        event_id=event_id
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def calculate_balance(db: Session, user_id: str) -> int:
    balance = db.query(func.sum(PointsLedger.points)).filter(PointsLedger.user_id == user_id).scalar()
    return balance or 0

from app.services.level_service import update_user_level

def update_level(db: Session, user: User) -> int:
    balance = calculate_balance(db, user.id)
    return update_user_level(db, user, balance)

from app.services.achievement_service import check_and_award_achievements

def check_achievements(db: Session, user: User):
    check_and_award_achievements(db, user)
