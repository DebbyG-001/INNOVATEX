from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum

class RoleEnum(str, Enum):
    user = "user"
    admin = "admin"

class GoalCategoryEnum(str, Enum):
    savings = "savings"
    eco_action = "eco_action"
    investment = "investment"

class GoalStatusEnum(str, Enum):
    in_progress = "in_progress"
    completed = "completed"

class EventTypeEnum(str, Enum):
    round_up = "round_up"
    instant_save = "instant_save"
    milestone_deposit = "milestone_deposit"

class InitialGoal(BaseModel):
    name: str
    target_amount: float
    category: GoalCategoryEnum = Field(default=GoalCategoryEnum.savings)

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = Field(default=RoleEnum.user)
    initial_goal: Optional[InitialGoal] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = Field(default="bearer")
    role: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    points: int
    level: int

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    category: str = Field(default="savings")

class GoalContributeRequest(BaseModel):
    amount: float
    event_type: EventTypeEnum
    reference: Optional[str] = None

class GoalResponse(BaseModel):
    id: str
    name: str
    target_amount: float
    current_amount: float
    status: GoalStatusEnum
    points_earned: Optional[int] = None

class RewardResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    points_required: int
    stock: int

class RedemptionResponse(BaseModel):
    reward_id: str
    reward_name: str
    status: str = Field(default="confirmed")
    remaining_points: int

class UserDashboardResponse(BaseModel):
    user: UserResponse
    active_goals: List[GoalResponse]
    recent_redemptions: List[RedemptionResponse]

class AdminDashboardResponse(BaseModel):
    total_users: int
    active_goals_count: int
    total_points_distributed: int

class FraudEventResponse(BaseModel):
    event_id: str
    user_id: str
    risk_score: int
    reason: str
