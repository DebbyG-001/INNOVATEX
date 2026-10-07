from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionResult
from app.services.auth import get_current_user
from app.services.transactions import process_transaction

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    limit: int = 50,
    action_type: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.created_at.desc())
    )
    if action_type:
        query = query.filter(Transaction.action_type == action_type)
    return query.limit(limit).all()


@router.post("", response_model=TransactionResult)
def create_transaction(
    data: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = process_transaction(db=db, user=user, data=data)
    return result
