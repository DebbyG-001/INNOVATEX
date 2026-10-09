from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from app.database import get_db
from app.models.bill import Bill
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.bill import BillCreate, BillResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/bills", tags=["bills"])

@router.post("/", response_model=BillResponse)
def create_bill(
    bill: BillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_bill = Bill(
        user_id=current_user.id,
        title=bill.title,
        category=bill.category,
        amount=bill.amount,
        due_date=bill.due_date,
        recurrence=bill.recurrence,
        status="pending"
    )
    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)
    return new_bill

@router.get("/", response_model=List[BillResponse])
def get_bills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bills = db.query(Bill).filter(Bill.user_id == current_user.id).all()
    return bills

@router.post("/{bill_id}/pay")
def pay_bill(
    bill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Lock the bill for update to prevent concurrent double-payment
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).with_for_update().first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    if bill.status == "paid":
        raise HTTPException(status_code=400, detail="Bill is already paid")

    # Lock the account for update to prevent race conditions on balance deduction
    account = db.query(Account).filter(Account.user_id == current_user.id, Account.account_type == "savings").with_for_update().first()
    if not account:
        raise HTTPException(status_code=404, detail="No savings account found")
    if account.balance < bill.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    from app.schemas.transaction import TransactionCreate
    from app.services.transactions import process_transaction

    tx_data = TransactionCreate(
        account_id=account.id,
        action_type="bill_payment",
        amount=bill.amount,
        description=bill.title,
        recipient=bill.category,
    )

    # Process the transaction without committing yet to keep it atomic with the bill update
    result = process_transaction(db, current_user, tx_data, commit=False)
    
    # Mark bill as paid
    bill.status = "paid"

    # Generate next recurring bill
    if bill.recurrence != "Once":
        next_due = bill.due_date
        if bill.recurrence == "Weekly":
            next_due += timedelta(days=7)
        elif bill.recurrence == "Monthly":
            next_due += relativedelta(months=1)
        elif bill.recurrence == "Yearly":
            next_due += relativedelta(years=1)
        
        next_bill = Bill(
            user_id=current_user.id,
            title=bill.title,
            category=bill.category,
            amount=bill.amount,
            due_date=next_due,
            recurrence=bill.recurrence,
            status="pending"
        )
        db.add(next_bill)

    db.commit()
    return result
