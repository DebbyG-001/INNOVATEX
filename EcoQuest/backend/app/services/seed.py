import datetime
import bcrypt
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.gamification import Achievement, ChallengeMission, UserAchievement, UserXP
from app.models.goal import Goal
from app.models.savings import SavingsPlan
from app.models.transaction import Transaction
from app.models.user import User

STANDARD_ACHIEVEMENTS = [
    {
        "code": "FIRST_DIGITAL_PAYMENT",
        "name": "Make Your First Digital Payment",
        "description": "Complete your first simulated digital transfer, bill payment, or airtime recharge.",
        "xp_reward": 150,
        "icon_name": "bolt",
    },
    {
        "code": "FIRST_TRANSFER",
        "name": "First Transfer",
        "description": "Sent your first transfer through EcoQuest digital banking.",
        "xp_reward": 100,
        "icon_name": "leaf",
    },
    {
        "code": "BILL_PAYER",
        "name": "Bill Payer",
        "description": "Settled utility and service bills digitally without hassle.",
        "xp_reward": 120,
        "icon_name": "bill",
    },
    {
        "code": "GOAL_SETTER",
        "name": "Goal Setter",
        "description": "Created and structured your first targeted savings goal.",
        "xp_reward": 80,
        "icon_name": "bolt",
    },
    {
        "code": "GOAL_COMPLETED",
        "name": "Goal Crusher",
        "description": "Completed your first savings goal.",
        "xp_reward": 150,
        "icon_name": "target",
    },
    {
        "code": "SAVINGS_CHAMPION",
        "name": "Savings Champion",
        "description": "Accumulated over ₦100,000 in dedicated savings accounts.",
        "xp_reward": 250,
        "icon_name": "piggy",
    },
    {
        "code": "STREAK_MASTER",
        "name": "Streak Master",
        "description": "Maintained consecutive weekly savings activities for 3+ weeks.",
        "xp_reward": 200,
        "icon_name": "flame",
    },
    {
        "code": "LEVEL_UP",
        "name": "Level Up",
        "description": "Progressed through ranks to achieve Champion status.",
        "xp_reward": 300,
        "icon_name": "crown",
    },
]


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed_database(db: Session):
    # 1. Seed Achievements
    for ach_data in STANDARD_ACHIEVEMENTS:
        existing = db.query(Achievement).filter(Achievement.code == ach_data["code"]).first()
        if not existing:
            ach = Achievement(
                code=ach_data["code"],
                name=ach_data["name"],
                description=ach_data["description"],
                xp_reward=ach_data["xp_reward"],
                icon_name=ach_data["icon_name"],
            )
            db.add(ach)
    db.commit()

    # We no longer seed a fake demo user per the requirements.
    # The application will rely on real user interactions.
