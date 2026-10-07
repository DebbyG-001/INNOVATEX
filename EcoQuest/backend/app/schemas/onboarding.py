from typing import List, Optional
from pydantic import BaseModel


class OnboardingGoalInput(BaseModel):
    category: str
    custom_name: Optional[str] = None
    target_amount: float
    months: int = 6
    bank: str = "Ecobank Nigeria"
    current_amount: float = 0.0


class OnboardingSubmit(BaseModel):
    occupation: str  # student, salaried, civil_servant, business_owner, freelancer, other
    income_stability: str  # stable, variable, irregular
    monthly_target: int
    active_accounts: int
    has_emergency_savings: bool
    goals: List[OnboardingGoalInput]
