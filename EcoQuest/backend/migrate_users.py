import os
from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as conn:
        print("Adding active_accounts_count column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN active_accounts_count INTEGER DEFAULT 2;"))
            print("active_accounts_count added successfully.")
        except Exception as e:
            print(f"Skipping active_accounts_count: {e}")

        print("Adding digital_usage column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN digital_usage VARCHAR(50) DEFAULT 'moderate';"))
            print("digital_usage added successfully.")
        except Exception as e:
            print(f"Skipping digital_usage: {e}")
            
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
