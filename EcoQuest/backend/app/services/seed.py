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

    # 2. Check if demo user exists
    demo_email = "alex@example.com"
    demo_user = db.query(User).filter(User.email == demo_email).first()
    if not demo_user:
        hashed = hash_pw("password123")
        demo_user = User(
            name="Alex Johnson",
            email=demo_email,
            password_hash=hashed,
            has_completed_onboarding=True,
            occupation="student",
            income_stability="variable",
            customer_segment="student_saver",
            customer_segment_name="Student Saver",
            savings_profile="money_learner",
            savings_profile_name="Money Learner",
            financial_tier="essentials",
            financial_score=2,
            monthly_target=30000,
            has_emergency_savings=False,
            explanation_json='{"customer_segment":["You are a student building financial habits","Focusing on education and early savings milestones"],"savings_profile":["You selected an education-related goal as a student","You are starting your foundational financial growth journey"],"financial_tier":["Monthly target of ₦30,000 meets baseline threshold (+1)","2 active bank accounts utilized (+1)"]}',
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # User XP
        user_xp = UserXP(
            user_id=demo_user.id,
            xp=3750,
            points=2480,
            level_index=4,
            level_name="Champion",
            streak_days=14,
        )
        db.add(user_xp)

        # Accounts
        acc_savings = Account(
            user_id=demo_user.id,
            bank="Access Bank",
            account_number="•••• 4321",
            account_type="savings",
            name="Savings Account",
            balance=312450.0,
        )
        acc_current = Account(
            user_id=demo_user.id,
            bank="GTBank",
            account_number="•••• 8765",
            account_type="current",
            name="Current Account",
            balance=180230.0,
        )
        acc_flex = Account(
            user_id=demo_user.id,
            bank="First Bank",
            account_number="•••• 1234",
            account_type="flex",
            name="Flex Account",
            balance=50000.0,
        )
        db.add_all([acc_savings, acc_current, acc_flex])
        db.commit()
        db.refresh(acc_current)

        # Goals with Nigerian banks
        goal_1 = Goal(
            user_id=demo_user.id,
            name="Laptop Fund",
            category="device",
            target_amount=300000.0,
            current_amount=150000.0,
            duration=4,
            bank="Access Bank",
            required_monthly=37500.0,
            status="active",
        )
        goal_2 = Goal(
            user_id=demo_user.id,
            name="University Essentials",
            category="education",
            target_amount=100000.0,
            current_amount=25000.0,
            duration=3,
            bank="First Bank",
            required_monthly=25000.0,
            status="active",
        )
        goal_3 = Goal(
            user_id=demo_user.id,
            name="Travel Home",
            category="travel",
            target_amount=80000.0,
            current_amount=10000.0,
            duration=2,
            bank="GTBank",
            required_monthly=35000.0,
            status="active",
        )
        db.add_all([goal_1, goal_2, goal_3])

        # Savings plan with duration
        savings_plan = SavingsPlan(
            user_id=demo_user.id,
            name="Emergency Buffer Fund",
            target_amount=200000.0,
            current_amount=60000.0,
            duration_months=12,
            bank="Zenith Bank",
            status="active",
        )
        db.add(savings_plan)

        # Initial Transactions
        tx_1 = Transaction(
            user_id=demo_user.id,
            account_id=acc_current.id,
            type="credit",
            action_type="money_received",
            amount=25000.0,
            description="Money Received",
            recipient="From Chinedu Okafor",
            reference="SIM-EQ-RCV-984210",
            status="successful",
            is_simulated=True,
        )
        tx_2 = Transaction(
            user_id=demo_user.id,
            account_id=acc_current.id,
            type="debit",
            action_type="transfer",
            amount=15000.0,
            description="Transfer",
            recipient="To Adebayo Tunde (GTBank)",
            reference="SIM-EQ-TRF-983199",
            status="successful",
            is_simulated=True,
        )
        tx_3 = Transaction(
            user_id=demo_user.id,
            account_id=acc_current.id,
            type="debit",
            action_type="airtime",
            amount=1000.0,
            description="Airtime Purchase",
            recipient="MTN 0803 123 4567",
            reference="SIM-EQ-AIR-982845",
            status="successful",
            is_simulated=True,
        )
        tx_4 = Transaction(
            user_id=demo_user.id,
            account_id=acc_current.id,
            type="debit",
            action_type="bill_payment",
            amount=15000.0,
            description="Electricity Bill",
            recipient="IBEDC Electric",
            reference="SIM-EQ-BIL-979102",
            status="successful",
            is_simulated=True,
        )
        tx_5 = Transaction(
            user_id=demo_user.id,
            account_id=acc_current.id,
            type="credit",
            action_type="money_received",
            amount=120000.0,
            description="Salary Credit",
            recipient="Stipend Allocation",
            reference="SIM-EQ-RCV-974221",
            status="successful",
            is_simulated=True,
        )
        db.add_all([tx_1, tx_2, tx_3, tx_4, tx_5])

        # Missions
        m_1 = ChallengeMission(
            user_id=demo_user.id,
            code="SAVE_MONTHLY_50K",
            title="Save ₦50,000 This Month",
            description="Keep your financial goals compounding by moving ₦50k into your savings or goals this month.",
            category="saving",
            current_progress=32450.0,
            target_progress=50000.0,
            unit="₦",
            xp_reward=350,
            points_reward=500,
            status="active",
        )
        m_2 = ChallengeMission(
            user_id=demo_user.id,
            code="TRANSACT_5_TIMES",
            title="Make 5 Transactions",
            description="Use EcoQuest simulated transfers, bills, or airtime to build digital habits.",
            category="transaction",
            current_progress=3.0,
            target_progress=5.0,
            unit="txns",
            xp_reward=200,
            points_reward=300,
            status="active",
        )
        m_3 = ChallengeMission(
            user_id=demo_user.id,
            code="CARD_USAGE_3X",
            title="Use Your Card 3 Times",
            description="Execute transactions using your simulated debit card to earn cardholder points.",
            category="card",
            current_progress=1.0,
            target_progress=3.0,
            unit="swipes",
            xp_reward=150,
            points_reward=200,
            status="active",
        )
        db.add_all([m_1, m_2, m_3])

        # Completed Achievements for demo user
        all_achs = db.query(Achievement).all()
        for a in all_achs:
            ua = UserAchievement(
                user_id=demo_user.id,
                achievement_id=a.id,
                completed=True,
                completed_at=datetime.datetime.utcnow(),
            )
            db.add(ua)

        db.commit()
