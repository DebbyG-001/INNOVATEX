from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import User, Event, Mission
from typing import List

def get_recommended_missions(db: Session, user: User) -> List[Mission]:
    all_missions = db.query(Mission).all()
    if not all_missions:
        return []
        
    recommended = []
    
    # Analyze user's event history
    events = db.query(Event).filter(Event.user_id == user.id).all()
    
    savings_count = sum(1 for e in events if e.event_type == "savings_deposit")
    digital_count = sum(1 for e in events if e.event_type in ["bill_payment", "airtime_purchase"])
    
    # Deterministic rules based on persona / behaviour
    needs_savings_push = savings_count < 2
    needs_digital_push = digital_count < 2
    
    for mission in all_missions:
        # Check if user already completed it maximum times
        user_mission = next((um for um in user.missions if um.mission_id == mission.id), None)
        if user_mission and user_mission.completion_count >= mission.max_completions:
            continue
            
        category = mission.category.lower()
        if needs_savings_push and category == "saving":
            recommended.append(mission)
        elif needs_digital_push and category == "digital":
            recommended.append(mission)
        elif category == "education": # Always recommend education if not completed
            recommended.append(mission)
            
    # If no specific recommendations, just return general ones
    if not recommended:
        recommended = [m for m in all_missions if not any(um.mission_id == m.id and um.completion_count >= m.max_completions for um in user.missions)]
        
    # Return top 3 recommended missions
    return recommended[:3]
