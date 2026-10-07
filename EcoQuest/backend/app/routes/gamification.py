import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.gamification import Achievement, ChallengeMission, UserAchievement, UserXP, Reward, RewardRedemption
from app.models.user import User
from app.schemas.gamification import AchievementResponse, ChallengeResponse, XPResponse, RewardResponse, RewardRedemptionResponse
from app.services.auth import get_current_user
from app.services.rules_engine import calculate_level

router = APIRouter(prefix="/api/gamification", tags=["Gamification"])


@router.get("/xp", response_model=XPResponse)
def get_user_xp(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_xp = db.query(UserXP).filter(UserXP.user_id == user.id).first()
    if not user_xp:
        user_xp = UserXP(
            user_id=user.id,
            xp=0,
            points=0,
            level_index=1,
            level_name="Starter",
            streak_days=1,
        )
        db.add(user_xp)
        db.commit()
        db.refresh(user_xp)
    return user_xp


@router.get("/achievements", response_model=List[AchievementResponse])
def get_achievements(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_achievements = db.query(Achievement).all()
    user_achs = (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == user.id, UserAchievement.completed == True)
        .all()
    )
    completed_map = {ua.achievement_id: ua.completed_at for ua in user_achs}

    response = []
    for ach in all_achievements:
        is_done = ach.id in completed_map
        response.append(
            AchievementResponse(
                id=ach.id,
                code=ach.code,
                name=ach.name,
                description=ach.description,
                xp_reward=ach.xp_reward,
                icon_name=ach.icon_name,
                completed=is_done,
                completed_at=completed_map.get(ach.id),
            )
        )
    return response


@router.post("/achievements/{id}/complete")
def complete_achievement(id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ach = db.query(Achievement).filter(Achievement.id == id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")

    existing = (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == user.id, UserAchievement.achievement_id == ach.id)
        .first()
    )
    if existing and existing.completed:
        return {"message": "Achievement already completed", "already_completed": True}

    if not existing:
        existing = UserAchievement(
            user_id=user.id,
            achievement_id=ach.id,
            completed=True,
            completed_at=datetime.datetime.utcnow(),
        )
        db.add(existing)
    else:
        existing.completed = True
        existing.completed_at = datetime.datetime.utcnow()

    # Award XP once
    user_xp = db.query(UserXP).filter(UserXP.user_id == user.id).first()
    if user_xp:
        user_xp.xp += ach.xp_reward
        user_xp.points += 50
        lvl_idx, lvl_name = calculate_level(user_xp.xp)
        user_xp.level_index = lvl_idx
        user_xp.level_name = lvl_name

    db.commit()
    return {"message": f"Completed achievement: {ach.name}", "xp_awarded": ach.xp_reward}


@router.get("/missions", response_model=List[ChallengeResponse])
def get_missions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    missions = (
        db.query(ChallengeMission)
        .filter(ChallengeMission.user_id == user.id)
        .order_by(ChallengeMission.created_at.desc())
        .all()
    )
    return missions


@router.post("/missions/{id}/claim")
def claim_mission(id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mission = (
        db.query(ChallengeMission)
        .filter(ChallengeMission.id == id, ChallengeMission.user_id == user.id)
        .first()
    )
    if not mission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mission not found")

    if mission.status == "claimed":
        return {"message": "Reward already claimed"}

    if mission.current_progress < mission.target_progress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mission requirements not yet reached",
        )

    mission.status = "claimed"

    user_xp = db.query(UserXP).filter(UserXP.user_id == user.id).first()
    if user_xp:
        user_xp.xp += mission.xp_reward
        user_xp.points += mission.points_reward
        lvl_idx, lvl_name = calculate_level(user_xp.xp)
        user_xp.level_index = lvl_idx
        user_xp.level_name = lvl_name

    db.commit()
    return {
        "message": f"Claimed {mission.points_reward} points and {mission.xp_reward} XP!",
        "points_awarded": mission.points_reward,
        "xp_awarded": mission.xp_reward,
    }

@router.get("/rewards", response_model=List[RewardResponse])
def get_rewards(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rewards = db.query(Reward).filter(Reward.is_active == True).all()
    # Seed if empty
    if not rewards:
        seed_rewards = [
            Reward(code="AIRTIME_500", title="₦500 Airtime", description="Get ₦500 airtime on any network", points_cost=5000, category="airtime", value_display="₦500"),
            Reward(code="VOUCHER_1000", title="₦1,000 Shopping Voucher", description="Use at Shoprite or Spar", points_cost=10000, category="voucher", value_display="₦1,000"),
            Reward(code="DATA_1GB", title="1GB Data", description="1GB data bundle valid for 7 days", points_cost=4000, category="airtime", value_display="1GB"),
            Reward(code="CASH_5000", title="₦5,000 Cashback", description="Direct credit to your Flex account", points_cost=50000, category="perk", value_display="₦5,000"),
        ]
        db.add_all(seed_rewards)
        db.commit()
        rewards = db.query(Reward).filter(Reward.is_active == True).all()
    return rewards

@router.post("/rewards/{reward_id}/redeem", response_model=RewardRedemptionResponse)
def redeem_reward(reward_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reward = db.query(Reward).filter(Reward.id == reward_id, Reward.is_active == True).first()
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
        
    user_xp = db.query(UserXP).filter(UserXP.user_id == user.id).first()
    if not user_xp or user_xp.points < reward.points_cost:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient points")
        
    user_xp.points -= reward.points_cost
    
    import random
    import string
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    
    redemption = RewardRedemption(
        user_id=user.id,
        reward_id=reward.id,
        points_spent=reward.points_cost,
        status="completed",
        code=code
    )
    db.add(redemption)
    db.commit()
    db.refresh(redemption)
    
    return RewardRedemptionResponse(
        id=redemption.id,
        reward_id=reward.id,
        reward_title=reward.title,
        points_spent=redemption.points_spent,
        timestamp=redemption.created_at,
        status=redemption.status,
        code=redemption.code
    )
