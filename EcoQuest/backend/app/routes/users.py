import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    explanation = None
    if user.explanation_json:
        try:
            explanation = json.loads(user.explanation_json)
        except Exception:
            explanation = None

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        has_completed_onboarding=user.has_completed_onboarding,
        occupation=user.occupation,
        income_stability=user.income_stability,
        customer_segment=user.customer_segment,
        customer_segment_name=user.customer_segment_name,
        savings_profile=user.savings_profile,
        savings_profile_name=user.savings_profile_name,
        financial_tier=user.financial_tier,
        financial_score=user.financial_score or 2,
        monthly_target=user.monthly_target or 30000,
        has_emergency_savings=user.has_emergency_savings,
        active_accounts_count=user.active_accounts_count or 2,
        digital_usage=user.digital_usage or "moderate",
        explanation=explanation,
    )
