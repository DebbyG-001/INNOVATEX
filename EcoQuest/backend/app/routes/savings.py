from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.savings import SavingsPlan
from app.models.user import User
from app.schemas.savings import SavingsCreate, SavingsResponse, SavingsUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/savings", tags=["Savings"])

VALID_DURATIONS = [1, 2, 3, 4, 6, 9, 12, 18, 24, 36]


@router.get("", response_model=List[SavingsResponse])
def get_savings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = (
        db.query(SavingsPlan)
        .filter(SavingsPlan.user_id == user.id)
        .order_by(SavingsPlan.created_at.desc())
        .all()
    )
    return plans


@router.post("", response_model=SavingsResponse)
def create_savings(
    data: SavingsCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.target_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target amount must be greater than zero",
        )
    if data.duration_months not in VALID_DURATIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Duration must be one of: {VALID_DURATIONS} months",
        )

    plan = SavingsPlan(
        user_id=user.id,
        name=data.name.strip(),
        target_amount=data.target_amount,
        current_amount=data.current_amount,
        duration_months=data.duration_months,
        bank=data.bank,
        status="completed" if data.current_amount >= data.target_amount else "active",
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.put("/{id}", response_model=SavingsResponse)
def update_savings(
    id: int,
    data: SavingsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = (
        db.query(SavingsPlan)
        .filter(SavingsPlan.id == id, SavingsPlan.user_id == user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings plan not found")

    if data.current_amount is not None:
        plan.current_amount = data.current_amount
        if plan.current_amount >= plan.target_amount:
            plan.status = "completed"

    if data.target_amount is not None:
        plan.target_amount = data.target_amount

    if data.status is not None:
        plan.status = data.status

    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{id}")
def delete_savings(id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = (
        db.query(SavingsPlan)
        .filter(SavingsPlan.id == id, SavingsPlan.user_id == user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings plan not found")
    db.delete(plan)
    db.commit()
    return {"message": "Savings plan deleted successfully"}
