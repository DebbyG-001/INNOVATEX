import os
import sys

# Setup environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal
from app.models.user import User
from app.models.account import Account
from app.schemas.transaction import TransactionCreate
from app.services.transactions import process_transaction
from fastapi import HTTPException
import sys
import io

# Force UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

db = SessionLocal()

# Find the user whose Current Account has 5,000,000
current_acc = db.query(Account).filter(Account.account_type == "current", Account.balance >= 5000000).first()

if not current_acc:
    # Just grab any user that has accounts, or maybe the first user really has 0.
    # The user said the test user has: Savings = 0, Current = 5,000,000, Flex = 2000
    current_acc = db.query(Account).filter(Account.account_type == "current", Account.balance > 0).first()
    if not current_acc:
        current_acc = db.query(Account).filter(Account.account_type == "current").first()

if not current_acc:
    print("No current account found")
    sys.exit(1)

user = db.query(User).filter(User.id == current_acc.user_id).first()

# Get accounts
savings_acc = db.query(Account).filter(Account.user_id == user.id, Account.account_type == "savings").first()
current_acc = db.query(Account).filter(Account.user_id == user.id, Account.account_type == "current").first()
flex_acc = db.query(Account).filter(Account.user_id == user.id, Account.account_type == "flex").first()

print("Initial Balances:")
print(f"Current Account = {current_acc.balance}")
print(f"Savings Account = {savings_acc.balance}")
print(f"Flex Account = {flex_acc.balance}")
print("---")

def run_test(test_name, account, amount):
    print(f"Running {test_name}: Debit from {account.account_type} for {amount}")
    data = TransactionCreate(
        account_id=account.id,
        action_type="transfer",
        amount=amount,
        description="Test Transfer",
        recipient="Test Recipient"
    )
    try:
        process_transaction(db=db, user=user, data=data)
        db.commit()
        print(f"SUCCESS")
    except HTTPException as e:
        db.rollback()
        print(f"FAIL: {e.detail}")
    
    # Reload from DB to verify balances
    db.refresh(account)
    print(f"New Balance of {account.account_type} = {account.balance}")
    print("---")

# Test 1: Current Account 
run_test("Test 1", current_acc, 1000)

# Test 2: Savings Account
run_test("Test 2", savings_acc, 1000)

# Test 3: Flex Account
run_test("Test 3", flex_acc, 1000)

db.close()
