import uuid
import time
import random
import httpx
from datetime import datetime, timezone
from app.core.database import SessionLocal
from app.models.models import User

API_URL = "http://127.0.0.1:8000/events"

EVENT_TYPES = [
    "savings_deposit",
    "financial_quiz_completed",
    "health_check_completed",
    "login_streak_maintained"
]

def run_simulator(simulate_ab_test=False):
    db = SessionLocal()
    users = db.query(User).all()
    db.close()

    if not users:
        print("No users found in the database. Please run 'python -m app.seed' first.")
        return

    if simulate_ab_test:
        print("--- Running A/B Simulation ---")
        half = len(users) // 2
        control_group = users[:half]
        gamified_group = users[half:]
        
        print(f"Control Group: {len(control_group)} users | Gamified Group: {len(gamified_group)} users")
        
        # In a real simulation, we would skew the probabilities based on the group
        # Gamified group has higher chance of triggering positive events
        
    else:
        print(f"Loaded {len(users)} synthetic users. Starting standard simulator...")

    with httpx.Client() as client:
        try:
            for i in range(10):  # Simulate 10 events
                if simulate_ab_test:
                    # Gamified group is more likely to act
                    group = "Gamified" if random.random() < 0.7 else "Control"
                    user = random.choice(gamified_group if group == "Gamified" else control_group)
                    
                    if group == "Gamified":
                        event_type = random.choice(["savings_deposit", "financial_quiz_completed"])
                    else:
                        event_type = random.choice(EVENT_TYPES)
                else:
                    user = random.choice(users)
                    event_type = random.choice(EVENT_TYPES)
                    group = "Standard"
                
                amount = None
                if event_type == "savings_deposit":
                    amount = random.choice([1000, 2000, 5000, 10000])
                
                payload = {
                    "event_id": str(uuid.uuid4()),
                    "user_id": user.id,
                    "event_type": event_type,
                    "amount": amount,
                    "currency": "NGN" if amount else None,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "metadata_json": {"simulated": True, "ab_group": group}
                }

                print(f"[{i+1}/10] [{group}] Firing '{event_type}' for '{user.name}'...")
                response = client.post(API_URL, json=payload)
                
                if response.status_code in [200, 202]:
                    result = response.json()
                    print(f"   Success! Points Awarded: {result.get('points_awarded')}, Status: {result.get('status')}")
                else:
                    print(f"   Failed! Code: {response.status_code}, Response: {response.text}")
                
                time.sleep(1)
        except httpx.ConnectError:
            print("Error: Could not connect to the API. Is the server running (uvicorn app.main:app --reload)?")

if __name__ == "__main__":
    import sys
    ab_test = "--ab-test" in sys.argv
    run_simulator(simulate_ab_test=ab_test)
