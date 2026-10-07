from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.account import AccountResponse, AddFundsRequest
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.get("", response_model=List[AccountResponse])
def get_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(Account).filter(Account.user_id == user.id).all()
    return accounts


@router.get("/{id}", response_model=AccountResponse)
def get_account_by_id(id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = (
        db.query(Account)
        .filter(Account.id == id, Account.user_id == user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account


@router.post("/funds")
def add_funds(
    data: AddFundsRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than zero",
        )
    account = (
        db.query(Account)
        .filter(Account.id == data.account_id, Account.user_id == user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    account.balance += data.amount

    import random
    ref = f"SIM-EQ-FND-{random.randint(100000, 999999)}"
    tx = Transaction(
        user_id=user.id,
        account_id=account.id,
        type="credit",
        action_type="funding",
        amount=data.amount,
        description=f"Top Up / Added Funds ({account.name})",
        recipient="Self Funding",
        reference=ref,
        status="successful",
        is_simulated=True,
    )
    db.add(tx)
    db.commit()
    db.refresh(account)
    db.refresh(tx)

    from app.services.achievements import evaluate_achievements
    evaluate_achievements(user.id, db)

    return {
        "account": account,
        "transaction": tx,
        "message": f"Added ₦{data.amount:,.2f} to {account.name}. (Note: Funding does not award XP)",
    }
