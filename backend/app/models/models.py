import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_count = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    goals = relationship("FinancialGoal", back_populates="user")
    missions = relationship("UserMission", back_populates="user")
    events = relationship("Event", back_populates="user")
    ledger_entries = relationship("PointsLedger", back_populates="user")
    redemptions = relationship("Redemption", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")

class FinancialGoal(Base):
    __tablename__ = "financial_goals"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    deadline = Column(DateTime, nullable=True)
    status = Column(String, default="active") # active, completed, cancelled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="goals")

class Mission(Base):
    __tablename__ = "missions"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False) # saving, financial_education, etc.
    criteria = Column(JSON, nullable=False) # criteria rules
    reward_points = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    max_completions = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user_missions = relationship("UserMission", back_populates="mission")

class UserMission(Base):
    __tablename__ = "user_missions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    mission_id = Column(String, ForeignKey("missions.id"), nullable=False)
    progress = Column(JSON, default=dict)
    status = Column(String, default="available") # available, active, completed, expired, blocked
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    completion_count = Column(Integer, default=0)

    user = relationship("User", back_populates="missions")
    mission = relationship("Mission", back_populates="user_missions")

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, unique=True, index=True, nullable=False) # client/external provided unique ID
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_type = Column(String, nullable=False)
    event_reference = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    currency = Column(String, nullable=True)
    timestamp = Column(DateTime, nullable=False)
    status = Column(String, default="received") # received, validated, processed, rejected, flagged, reversed
    metadata_json = Column("metadata", JSON, nullable=True) # avoiding reserved keyword conflicts if any
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="events")

class PointsLedger(Base):
    __tablename__ = "points_ledger"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=True)
    points = Column(Integer, nullable=False) # Can be positive or negative
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="ledger_entries")
    event = relationship("Event")

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    points_required = Column(Integer, nullable=False)
    stock = Column(Integer, default=-1) # -1 could mean infinite
    partner = Column(String, nullable=True)
    status = Column(String, default="active") # active, inactive
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    redemptions = relationship("Redemption", back_populates="reward")

class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    reward_id = Column(String, ForeignKey("rewards.id"), nullable=False)
    points_spent = Column(Integer, nullable=False)
    status = Column(String, default="pending") # pending, completed, failed, cancelled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="redemptions")
    reward = relationship("Reward", back_populates="redemptions")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    criteria = Column(JSON, nullable=False)

    user_achievements = relationship("UserAchievement", back_populates="achievement")

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(String, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")

class FraudEvent(Base):
    __tablename__ = "fraud_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    risk_score = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

