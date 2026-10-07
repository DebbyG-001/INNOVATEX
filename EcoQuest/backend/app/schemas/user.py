from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    has_completed_onboarding: bool
    occupation: Optional[str] = "student"
    income_stability: Optional[str] = "variable"
    customer_segment: Optional[str] = "student_saver"
    customer_segment_name: Optional[str] = "Student Saver"
    savings_profile: Optional[str] = "money_learner"
    savings_profile_name: Optional[str] = "Money Learner"
    financial_tier: Optional[str] = "essentials"
    financial_score: int = 2
    monthly_target: int = 30000
    has_emergency_savings: bool = False
    explanation: Optional[Dict[str, List[str]]] = None

    class Config:
        from_attributes = True
