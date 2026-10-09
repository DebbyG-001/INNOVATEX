import datetime
import random
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.gamification import Achievement, ChallengeMission, UserAchievement, UserXP
from app.models.goal import Goal
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate
from app.services.rules_engine import calculate_level


def process_transaction(db: Session, user: User, data: TransactionCreate, commit: bool = True):
    account = (
        db.query(Account)
        .filter(Account.id == data.account_id, Account.user_id == user.id)
        .with_for_update()
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    action_type = data.action_type
    amount = data.amount

    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction amount must be greater than zero",
        )

    # Debit checks
    if action_type in ["transfer", "bill_payment", "airtime", "saving_transfer"]:
        if account.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance in {account.name}. Available: ₦{account.balance:,.2f}",
            )
        account.balance -= amount
        tx_type = "debit"
    elif action_type in ["funding", "money_received"]:
        account.balance += amount
        tx_type = "credit"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown action type: {action_type}",
        )

    # Save money can credit savings account or goal
    if action_type == "saving_transfer":
        if data.goal_id:
            goal = db.query(Goal).filter(Goal.id == data.goal_id, Goal.user_id == user.id).with_for_update().first()
            if goal:
                if goal.status == "completed":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Goal is already completed."
                    )
                if goal.current_amount + amount > goal.target_amount:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Amount exceeds remaining goal target. You only need ₦{goal.target_amount - goal.current_amount:,.2f} more."
                    )
                goal.current_amount += amount
                if goal.current_amount >= goal.target_amount:
                    goal.status = "completed"
        else:
            # Credit savings account
            savings_acc = (
                db.query(Account)
                .filter(Account.user_id == user.id, Account.account_type == "savings")
                .with_for_update()
                .first()
            )
            if savings_acc:
                savings_acc.balance += amount

    # Generate unique reference
    prefix = {
        "transfer": "TRF",
        "bill_payment": "BIL",
        "airtime": "AIR",
        "saving_transfer": "SAV",
        "funding": "FND",
        "money_received": "RCV",
    }.get(action_type, "TX")
    ref_num = random.randint(100000, 999999)
    reference = f"SIM-EQ-{prefix}-{ref_num}"

    # Record in PostgreSQL
    tx = Transaction(
        user_id=user.id,
        account_id=account.id,
        type=tx_type,
        action_type=action_type,
        amount=amount,
        description=data.description,
        recipient=data.recipient,
        reference=reference,
        status="successful",
        is_simulated=True,
    )
    db.add(tx)

    # Ensure UserXP record exists
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
        db.flush()

    xp_awarded = 0
    points_awarded = 0
    # Gamification points/XP for standard actions:
    # Funding transactions award 0 XP/points per anti-farming policy
    if action_type == "funding":
        xp_gain = 0
        points_gain = 0
    elif action_type == "saving_transfer":
        # Substantial XP and reward points for disciplined saving
        xp_gain = 50
        points_gain = int(amount * 0.01) + 50
    elif action_type == "bill_payment":
        xp_gain = 30
        points_gain = 45
    elif action_type == "transfer":
        xp_gain = 20
        points_gain = 30
    elif action_type == "airtime":
        xp_gain = 15
        points_gain = 25
    else:
        xp_gain = 10
        points_gain = 10

    xp_awarded += xp_gain
    points_awarded += points_gain

    # Update UserXP in PostgreSQL
    user_xp.xp += xp_awarded
    user_xp.points += points_awarded
    new_lvl_idx, new_lvl_name = calculate_level(user_xp.xp)
    user_xp.level_index = new_lvl_idx
    user_xp.level_name = new_lvl_name

    # Advance active challenge missions
    missions = (
        db.query(ChallengeMission)
        .filter(ChallengeMission.user_id == user.id, ChallengeMission.status == "active")
        .all()
    )
    for m in missions:
        if m.code == "TRANSACT_5_TIMES" and action_type in ["transfer", "bill_payment", "airtime"]:
            m.current_progress = min(m.target_progress, m.current_progress + 1)
            if m.current_progress >= m.target_progress:
                m.status = "completed"
        elif m.code == "SAVE_MONTHLY_50K" and action_type == "saving_transfer":
            m.current_progress = min(m.target_progress, m.current_progress + amount)
            if m.current_progress >= m.target_progress:
                m.status = "completed"
        elif m.code == "FIRST_GUIDED_MISSION" and action_type == "saving_transfer":
            m.current_progress = min(m.target_progress, m.current_progress + amount)
            if m.current_progress >= m.target_progress:
                m.status = "completed"

    if commit:
        db.commit()
        db.refresh(tx)
        db.refresh(account)

    # Evaluate all achievements globally
    from app.services.achievements import evaluate_achievements
    newly_unlocked = evaluate_achievements(user.id, db, commit=commit)
    first_payment_unlocked = "FIRST_DIGITAL_PAYMENT" in (newly_unlocked or [])

    return {
        "transaction": tx,
        "new_balance": account.balance,
        "xp_awarded": xp_awarded,
        "points_awarded": points_awarded,
        "first_payment_achievement_unlocked": first_payment_unlocked,
        "message": "Transaction completed successfully",
    }
