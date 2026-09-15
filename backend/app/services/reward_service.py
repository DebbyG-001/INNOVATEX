from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Reward, Redemption, User
from app.services.points_service import calculate_balance, add_ledger_entry

def get_rewards(db: Session):
    return db.query(Reward).all()

def redeem_reward(db: Session, user: User, reward_id: str) -> Redemption:
    # 1. Fetch Reward
    reward = db.query(Reward).filter(Reward.id == reward_id).with_for_update().first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
        
    # 2. Check stock
    if reward.stock == 0:
        raise HTTPException(status_code=400, detail="Reward is out of stock")
        
    # 3. Check Balance
    balance = calculate_balance(db, user.id)
    if balance < reward.points_required:
        raise HTTPException(status_code=400, detail="Insufficient points")
        
    # 4. Atomic Transaction: Negative Ledger Entry, Redemption, Reduce Stock
    try:
        # Negative Ledger
        add_ledger_entry(
            db=db,
            user_id=user.id,
            points=-reward.points_required,
            reason=f"Redeemed reward: {reward.name}"
        )
        
        # Create Redemption
        redemption = Redemption(
            user_id=user.id,
            reward_id=reward.id,
            points_spent=reward.points_required,
            status="completed"
        )
        db.add(redemption)
        
        # Reduce Stock
        if reward.stock > 0:
            reward.stock -= 1
            
        db.commit()
        db.refresh(redemption)
        return redemption
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Redemption failed. Please try again.")

def get_user_redemptions(db: Session, user: User):
    return db.query(Redemption).filter(Redemption.user_id == user.id).all()
