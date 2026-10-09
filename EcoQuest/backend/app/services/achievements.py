import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.gamification import Achievement, UserAchievement, UserXP
from app.models.transaction import Transaction
from app.models.goal import Goal
from app.models.account import Account
from app.services.rules_engine import calculate_level

def evaluate_achievements(user_id: str, db: Session, commit: bool = True):
    # Get all achievements
    all_achievements = db.query(Achievement).all()
    ach_map = {ach.code: ach for ach in all_achievements}

    # Get user's completed achievements
    user_achs = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id,
        UserAchievement.completed == True
    ).all()
    completed_codes = {ua.achievement.code for ua in user_achs if ua.achievement}

    user_xp = db.query(UserXP).filter(UserXP.user_id == user_id).first()
    if not user_xp:
        return

    xp_awarded = 0
    points_awarded = 0
    newly_unlocked = []

    def unlock(code: str):
        nonlocal xp_awarded, points_awarded
        if code in completed_codes:
            return
        ach = ach_map.get(code)
        if not ach:
            return
        
        # Check if row exists but not completed
        existing = db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == ach.id
        ).first()

        if existing:
            existing.completed = True
            existing.completed_at = datetime.datetime.utcnow()
        else:
            new_ua = UserAchievement(
                user_id=user_id,
                achievement_id=ach.id,
                completed=True,
                completed_at=datetime.datetime.utcnow()
            )
            db.add(new_ua)
        
        xp_awarded += ach.xp_reward
        points_awarded += 50
        completed_codes.add(code)
        newly_unlocked.append(code)

    # 1. FIRST_DIGITAL_PAYMENT
    if "FIRST_DIGITAL_PAYMENT" not in completed_codes:
        digital_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.action_type.in_(["transfer", "bill_payment", "airtime"])
        ).count()
        if digital_txs > 0:
            unlock("FIRST_DIGITAL_PAYMENT")

    # 2. FIRST_TRANSFER
    if "FIRST_TRANSFER" not in completed_codes:
        transfers = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.action_type == "transfer"
        ).count()
        if transfers > 0:
            unlock("FIRST_TRANSFER")

    # 3. BILL_PAYER
    if "BILL_PAYER" not in completed_codes:
        bills = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.action_type == "bill_payment"
        ).count()
        if bills > 0:
            unlock("BILL_PAYER")

    # 4. GOAL_SETTER
    if "GOAL_SETTER" not in completed_codes:
        goals = db.query(Goal).filter(Goal.user_id == user_id).count()
        if goals > 0:
            unlock("GOAL_SETTER")

    # 4b. GOAL_COMPLETED
    if "GOAL_COMPLETED" not in completed_codes:
        completed_goals = db.query(Goal).filter(
            Goal.user_id == user_id,
            Goal.status == "completed"
        ).count()
        if completed_goals > 0:
            unlock("GOAL_COMPLETED")

    # 5. SAVINGS_CHAMPION
    if "SAVINGS_CHAMPION" not in completed_codes:
        savings_balance = db.query(func.sum(Account.balance)).filter(
            Account.user_id == user_id,
            Account.account_type.in_(["savings", "flex"])
        ).scalar() or 0.0
        if savings_balance >= 10000000:
            unlock("SAVINGS_CHAMPION")

    # 6. STREAK_MASTER
    if "STREAK_MASTER" not in completed_codes:
        if user_xp.streak_days >= 21:
            unlock("STREAK_MASTER")

    # 7. LEVEL_UP (Champion status => index >= 4)
    if "LEVEL_UP" not in completed_codes:
        if user_xp.level_index >= 4:
            unlock("LEVEL_UP")

    if newly_unlocked:
        user_xp.xp += xp_awarded
        user_xp.points += points_awarded
        new_lvl_idx, new_lvl_name = calculate_level(user_xp.xp)
        user_xp.level_index = new_lvl_idx
        user_xp.level_name = new_lvl_name
        
        # Re-evaluate level up if xp gained caused a level up to champion
        if "LEVEL_UP" not in completed_codes and user_xp.level_index >= 4:
            unlock("LEVEL_UP")
            user_xp.xp += ach_map["LEVEL_UP"].xp_reward
            user_xp.points += 50
            new_lvl_idx, new_lvl_name = calculate_level(user_xp.xp)
            user_xp.level_index = new_lvl_idx
            user_xp.level_name = new_lvl_name

        if commit:
            db.commit()

    return newly_unlocked
