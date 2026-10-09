from app.database import engine
from sqlalchemy import text

def add_index():
    with engine.connect() as conn:
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_transaction_user_id_created_at ON transactions (user_id, created_at DESC);"))
            conn.commit()
            print("Index added successfully.")
        except Exception as e:
            print("Failed to add index:", e)

if __name__ == "__main__":
    add_index()
