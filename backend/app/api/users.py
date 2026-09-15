from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.schemas.openapi import UserDashboardResponse, UserResponse, GoalResponse, RedemptionResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/user", tags=["User Dashboard"])

@router.get("/dashboard", response_model=UserDashboardResponse, summary="Complete profile, points, and active goals in one call")
def get_user_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_response = UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        points=current_user.points,
        level=current_user.level
    )
    
    active_goals = []
    for goal in current_user.goals:
        if goal.status == "in_progress" or goal.status == "active":
            # Models might use active, schema uses in_progress
            status = "in_progress" if goal.status in ["active", "in_progress"] else "completed"
            active_goals.append(GoalResponse(
                id=goal.id,
                name=goal.name,
                target_amount=goal.target_amount,
                current_amount=goal.current_amount,
                status=status,
                points_earned=None
            ))
            
    recent_redemptions = []
    # Assuming user.redemptions is sorted or we can just return the last few
    for red in current_user.redemptions[-5:]: # Get last 5
        recent_redemptions.append(RedemptionResponse(
            reward_id=red.reward_id,
            reward_name=red.reward.name if red.reward else "Unknown",
            status=red.status,
            remaining_points=current_user.points # the remaining points at the time, but returning current points is fine.
        ))
        
    return UserDashboardResponse(
        user=user_response,
        active_goals=active_goals,
        recent_redemptions=recent_redemptions
    )
