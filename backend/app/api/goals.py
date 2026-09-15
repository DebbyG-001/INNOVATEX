from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User, FinancialGoal
from app.schemas.openapi import GoalResponse, GoalCreate, GoalContributeRequest, GoalStatusEnum
from app.api.deps import get_current_user

router = APIRouter(prefix="/user", tags=["User Goals"])

@router.get("/goals", response_model=List[GoalResponse], summary="List all goals for current user")
def list_goals(current_user: User = Depends(get_current_user)):
    goals = []
    for goal in current_user.goals:
        status_val = GoalStatusEnum.in_progress if goal.status in ["active", "in_progress"] else GoalStatusEnum.completed
        goals.append(GoalResponse(
            id=goal.id,
            name=goal.name,
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            status=status_val,
            points_earned=0 # Assume 0 or calculate if needed
        ))
    return goals

@router.post("/goals", response_model=GoalResponse, status_code=status.HTTP_201_CREATED, summary="Create a new goal")
def create_goal(goal_in: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_goal = FinancialGoal(
        user_id=current_user.id,
        name=goal_in.name,
        target_amount=goal_in.target_amount,
        current_amount=0.0,
        status="active"
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    
    return GoalResponse(
        id=new_goal.id,
        name=new_goal.name,
        target_amount=new_goal.target_amount,
        current_amount=new_goal.current_amount,
        status=GoalStatusEnum.in_progress,
        points_earned=0
    )

@router.post("/goals/{goal_id}/contribute", response_model=GoalResponse, summary="Perform a transaction/event toward a goal")
def contribute_to_goal(goal_id: str, contribution: GoalContributeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(FinancialGoal).filter(FinancialGoal.id == goal_id, FinancialGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        
    if goal.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Goal is already completed")
        
    goal.current_amount += contribution.amount
    points_earned = 0
    
    # Very basic logic to mark as complete and give points
    if goal.current_amount >= goal.target_amount:
        goal.status = "completed"
        points_earned = 100 # Example reward
        current_user.points += points_earned
        
    db.commit()
    db.refresh(goal)
    db.refresh(current_user)
    
    status_val = GoalStatusEnum.completed if goal.status == "completed" else GoalStatusEnum.in_progress
    
    return GoalResponse(
        id=goal.id,
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        status=status_val,
        points_earned=points_earned
    )
