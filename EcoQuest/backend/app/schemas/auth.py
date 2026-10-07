from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str = Field(..., min_length=6, max_length=100)

    @field_validator("confirm_password")
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserBrief(BaseModel):
    id: str
    name: str
    email: str
    has_completed_onboarding: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBrief
