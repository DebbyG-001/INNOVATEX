from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from datetime import datetime, timedelta

from app.database import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])

@router.post("/", response_model=BudgetResponse)
def create_budget(
    budget: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_budget = Budget(
        user_id=current_user.id,
        name=budget.name,
        limit_amount=budget.limit_amount,
        color=budget.color
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    
    # Calculate spent amount for the current month for each budget
    # To keep it simple, we sum debit transactions matching the category name or general debits.
    # In a real app, transactions would have a category_id. 
    # For this simulation, we'll map action_types to categories or just search by name.
    
    first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    response = []
    for b in budgets:
        # Simple mapping heuristics for simulation
        action_types = []
        if "utilit" in b.name.lower():
            action_types = ["bill_payment"]
        elif "transport" in b.name.lower() or "car" in b.name.lower():
            action_types = ["airtime"] # proxy
        elif "food" in b.name.lower():
            action_types = ["transfer"] # proxy
        else:
            action_types = ["transfer", "bill_payment", "airtime"]

        spent_amt = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "debit",
            Transaction.action_type.in_(action_types),
            Transaction.created_at >= first_day_of_month
        ).scalar() or 0.0

        # Adjust heuristic just to ensure it looks reasonable if multiple categories map to same action_type
        if "utilit" not in b.name.lower() and "transport" not in b.name.lower() and "food" not in b.name.lower():
            spent_amt = spent_amt * 0.3 # distribute arbitrarily for demo if unmapped

        resp_dict = {
            "id": b.id,
            "name": b.name,
            "limit_amount": b.limit_amount,
            "color": b.color,
            "created_at": b.created_at,
            "spent": float(spent_amt)
        }
        response.append(resp_dict)
        
    return response

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted"}
