from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.models import User, Mission, UserMission

def get_eligible_missions(db: Session, user: User):
    # For MVP, return all active missions that user hasn't maxed out
    # or hasn't even started.
    missions = db.query(Mission).all()
    user_missions = {um.mission_id: um for um in user.missions}
    
    eligible = []
    for mission in missions:
        um = user_missions.get(mission.id)
        if not um or um.completion_count < mission.max_completions:
            eligible.append(mission)
    return eligible

def start_mission(db: Session, user: User, mission: Mission) -> UserMission:
    um = db.query(UserMission).filter(
        UserMission.user_id == user.id, 
        UserMission.mission_id == mission.id
    ).first()

    if um:
        # Already started
        return um
    
    um = UserMission(
        user_id=user.id,
        mission_id=mission.id,
        status="active",
        started_at=datetime.now(timezone.utc),
        progress={}
    )
    db.add(um)
    db.commit()
    db.refresh(um)
    return um

def get_mission(db: Session, mission_id: str) -> Mission:
    return db.query(Mission).filter(Mission.id == mission_id).first()
