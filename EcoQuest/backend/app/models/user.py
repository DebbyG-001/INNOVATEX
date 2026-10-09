import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Onboarding & Behavioral Profile
    has_completed_onboarding = Column(Boolean, default=False)
    occupation = Column(String(50), nullable=True, default="student")
    income_stability = Column(String(50), nullable=True, default="variable")
    customer_segment = Column(String(50), nullable=True, default="student_saver")
    customer_segment_name = Column(String(100), nullable=True, default="Student Saver")
    savings_profile = Column(String(50), nullable=True, default="money_learner")
    savings_profile_name = Column(String(100), nullable=True, default="Money Learner")
    financial_tier = Column(String(50), nullable=True, default="essentials")
    financial_score = Column(Integer, default=2)
    monthly_target = Column(Integer, default=30000)
    has_emergency_savings = Column(Boolean, default=False)
    active_accounts_count = Column(Integer, default=2)
    digital_usage = Column(String(50), nullable=True, default="moderate")
    explanation_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    savings_plans = relationship("SavingsPlan", back_populates="user", cascade="all, delete-orphan")
    xp_record = relationship("UserXP", back_populates="user", uselist=False, cascade="all, delete-orphan")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    bills = relationship("Bill", back_populates="user", cascade="all, delete-orphan")
