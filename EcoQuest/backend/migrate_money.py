import os, sys
sys.path.append('.')
from sqlalchemy import text
from app.database import engine

statements = [
    "ALTER TABLE accounts ALTER COLUMN balance TYPE integer USING (balance * 100)::integer;",
    "ALTER TABLE transactions ALTER COLUMN amount TYPE integer USING (amount * 100)::integer;",
    "ALTER TABLE savings_plans ALTER COLUMN target_amount TYPE integer USING (target_amount * 100)::integer;",
    "ALTER TABLE savings_plans ALTER COLUMN current_amount TYPE integer USING (current_amount * 100)::integer;",
    "ALTER TABLE goals ALTER COLUMN target_amount TYPE integer USING (target_amount * 100)::integer;",
    "ALTER TABLE goals ALTER COLUMN current_amount TYPE integer USING (current_amount * 100)::integer;",
    "ALTER TABLE goals ALTER COLUMN required_monthly TYPE integer USING (required_monthly * 100)::integer;",
    "ALTER TABLE bills ALTER COLUMN amount TYPE integer USING (amount * 100)::integer;",
]

def migrate():
    try:
        with engine.begin() as conn:
            for stmt in statements:
                try:
                    conn.execute(text(stmt))
                    print(f"Executed: {stmt}")
                except Exception as e:
                    if "does not exist" in str(e):
                        print(f"Skipped (column/table missing): {stmt}")
                    else:
                        print(f"Failed: {stmt} - {e}")
        print("Migration complete.")
    except Exception as e:
        print(f"Global Error: {e}")

if __name__ == '__main__':
    migrate()
