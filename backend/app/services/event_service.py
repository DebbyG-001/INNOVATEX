from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.models import User, Event, UserMission, Mission, FinancialGoal
from app.schemas.event import EventCreate
from app.services.points_service import add_ledger_entry, update_level, check_achievements
from app.services.streak_service import update_streak
from app.services.abuse_service import calculate_risk_score

def process_event(db: Session, event_in: EventCreate) -> dict:
    # 1. Fetch user
    user = db.query(User).filter(User.id == event_in.user_id).first()
    if not user:
        return {"status": "rejected", "points_awarded": 0, "reason": "user not found"}

    # 2. Idempotency Check (Rule 5)
    existing_event = db.query(Event).filter(Event.event_id == event_in.event_id).first()
    if existing_event:
        return {"status": "processed", "points_awarded": 0, "reason": "duplicate event"}

    # 3. Save Event
    new_event = Event(
        event_id=event_in.event_id,
        user_id=event_in.user_id,
        event_type=event_in.event_type,
        event_reference=event_in.event_reference,
        amount=event_in.amount,
        currency=event_in.currency,
        timestamp=event_in.timestamp,
        metadata_json=event_in.metadata_json,
        status="pending"
    )
    db.add(new_event)
    db.flush()

    # 4. Anti-Abuse Risk Score
    risk = calculate_risk_score(db, new_event)
    if risk >= 80:
        new_event.status = "flagged"
        db.commit()
        return {"status": "flagged", "points_awarded": 0, "risk_score": risk}

    # 5. Process Missions
    # Find active missions for the user that match this event type
    active_missions = db.query(UserMission).join(Mission).filter(
        UserMission.user_id == user.id,
        UserMission.status == "active"
    ).all()

    total_points = 0

    for um in active_missions:
        mission = um.mission
        
        # Check criteria (simple logic for MVP)
        criteria = mission.criteria
        if criteria.get("event_type") == new_event.event_type:
            # check min amount
            if "minimum_amount" in criteria and new_event.amount < criteria["minimum_amount"]:
                continue
            
            # Condition met! Complete the mission
            um.status = "completed"
            um.completed_at = datetime.now(timezone.utc)
            um.completion_count += 1
            
            # Award Points
            points = mission.reward_points
            if points > 0:
                add_ledger_entry(
                    db=db, 
                    user_id=user.id, 
                    points=points, 
                    reason=f"Mission Completed: {mission.name}",
                    event_id=new_event.id
                )
                total_points += points

    # Update goals implicitly if needed (MVP basic goal logic)
    if new_event.event_type == "savings_deposit":
        # Find user's active goals and update one
        goal = db.query(FinancialGoal).filter(FinancialGoal.user_id == user.id, FinancialGoal.status == "active").first()
        if goal:
            goal.current_amount += (new_event.amount or 0)
            if goal.current_amount >= goal.target_amount:
                goal.status = "completed"

    # Updates
    update_streak(db, user, new_event)
    update_level(db, user)
    check_achievements(db, user)

    new_event.status = "processed"
    db.commit()

    return {
        "status": "processed",
        "points_awarded": total_points
    }
