from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User, Reward, Redemption
from app.schemas.openapi import RewardResponse, RedemptionResponse
from app.api.deps import get_current_user

router = APIRouter(tags=["Rewards"])

@router.get("/rewards", response_model=List[RewardResponse], summary="List available rewards catalog")
def list_rewards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rewards = db.query(Reward).filter(Reward.status == "active").all()
    return [
        RewardResponse(
            id=r.id,
            name=r.name,
            description=r.description,
            points_required=r.points_required,
            stock=r.stock
        ) for r in rewards
    ]

@router.post("/user/rewards/{reward_id}/redeem", response_model=RedemptionResponse, summary="Redeem a reward using current user points")
def redeem_reward(reward_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
        
    if reward.stock == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reward out of stock")
        
    if current_user.points < reward.points_required:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient points")
        
    current_user.points -= reward.points_required
    if reward.stock > 0:
        reward.stock -= 1
        
    redemption = Redemption(
        user_id=current_user.id,
        reward_id=reward.id,
        points_spent=reward.points_required,
        status="confirmed"
    )
    
    db.add(redemption)
    db.commit()
    db.refresh(current_user)
    
    return RedemptionResponse(
        reward_id=reward.id,
        reward_name=reward.name,
        status="confirmed",
        remaining_points=current_user.points
    )
