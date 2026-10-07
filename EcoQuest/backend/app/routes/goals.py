from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalResponse, GoalUpdate
from app.services.auth import get_current_user
from app.services.rules_engine import calculate_required_monthly

router = APIRouter(prefix="/api/goals", tags=["Goals"])


@router.get("", response_model=List[GoalResponse])
def get_goals(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(Goal).filter(
        Goal.user_id == user.id,
        Goal.status != "completed"
    ).order_by(Goal.created_at.desc()).all()
    return goals


@router.post("", response_model=GoalResponse)
def create_goal(data: GoalCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.target_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target amount must be greater than zero",
        )

    req_monthly = calculate_required_monthly(
        data.target_amount, data.current_amount, data.duration
    )

    goal = Goal(
        user_id=user.id,
        name=data.name.strip(),
        category=data.category,
        target_amount=data.target_amount,
        current_amount=data.current_amount,
        duration=data.duration,
        bank=data.bank,
        required_monthly=req_monthly,
        status="completed" if data.current_amount >= data.target_amount else "active",
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    from app.services.achievements import evaluate_achievements
    evaluate_achievements(user.id, db)

    return goal


@router.put("/{id}", response_model=GoalResponse)
def update_goal(
    id: int,
    data: GoalUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = db.query(Goal).filter(Goal.id == id, Goal.user_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

    if data.current_amount is not None:
        goal.current_amount = data.current_amount
        goal.required_monthly = calculate_required_monthly(
            goal.target_amount, goal.current_amount, goal.duration
        )
        if goal.current_amount >= goal.target_amount:
            goal.status = "completed"

    if data.target_amount is not None:
        goal.target_amount = data.target_amount
        goal.required_monthly = calculate_required_monthly(
            goal.target_amount, goal.current_amount, goal.duration
        )

    if data.status is not None:
        goal.status = data.status

    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{id}")
def delete_goal(id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == id, Goal.user_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}
