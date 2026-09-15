from app.core.database import SessionLocal
from app.models.models import Mission, Reward, Achievement, User
from app.core.security import get_password_hash

def seed_data():
    db = SessionLocal()
    
    # 0. Users
    if not db.query(User).first():
        users = [
            User(
                name="Demo User",
                email="demo@ecoquest.com",
                password_hash=get_password_hash("password123"),
                level=1,
                streak_count=0
            ),
            User(
                name="Active Saver",
                email="saver@ecoquest.com",
                password_hash=get_password_hash("password123"),
                level=5,
                streak_count=3
            ),
            User(
                name="Newbie",
                email="newbie@ecoquest.com",
                password_hash=get_password_hash("password123"),
                level=1,
                streak_count=0
            )
        ]
        db.bulk_save_objects(users)
        db.commit()
        print("Users seeded.")
    
    # 1. Missions
    if not db.query(Mission).first():
        missions = [
            Mission(
                name="Save Starter",
                category="saving",
                description="Deposit ₦5,000 into a designated savings goal",
                reward_points=250,
                criteria={"event_type": "savings_deposit", "minimum_amount": 5000},
                max_completions=1
            ),
            Mission(
                name="Financial Quiz",
                category="financial_education",
                description="Pass a financial quiz",
                reward_points=75,
                criteria={"event_type": "financial_quiz_completed"},
                max_completions=1
            ),
            Mission(
                name="Savings Streak",
                category="saving",
                description="Maintain weekly contribution",
                reward_points=100,
                criteria={"event_type": "savings_deposit", "minimum_amount": 1000},
                max_completions=5
            ),
            Mission(
                name="Financial Health Check",
                category="responsible_banking",
                description="Complete monthly financial health check",
                reward_points=150,
                criteria={"event_type": "health_check_completed"},
                max_completions=1
            )
        ]
        db.bulk_save_objects(missions)
        db.commit()
        print("Missions seeded.")

    # 2. Rewards
    if not db.query(Reward).first():
        rewards = [
            Reward(name="₦500 Airtime", points_required=500, stock=-1),
            Reward(name="₦1,000 Partner Voucher", points_required=1000, stock=50),
            Reward(name="Merchant Discount", points_required=2000, stock=100),
            Reward(name="Premium Partner Reward", points_required=5000, stock=10),
            Reward(name="Higher-Value Reward", points_required=10000, stock=5)
        ]
        db.bulk_save_objects(rewards)
        db.commit()
        print("Rewards seeded.")

    # 3. Achievements
    if not db.query(Achievement).first():
        achievements = [
            Achievement(name="First Mission", criteria={"type": "mission_count", "count": 1}),
            Achievement(name="First Savings Goal", criteria={"type": "goal_count", "count": 1}),
            Achievement(name="Financial Learner", criteria={"type": "mission_category", "category": "financial_education"}),
            Achievement(name="7-Day Streak", criteria={"type": "streak_days", "count": 7}),
            Achievement(name="Reward Redeemer", criteria={"type": "redemption_count", "count": 1})
        ]
        db.bulk_save_objects(achievements)
        db.commit()
        print("Achievements seeded.")
        
    db.close()

if __name__ == "__main__":
    seed_data()
