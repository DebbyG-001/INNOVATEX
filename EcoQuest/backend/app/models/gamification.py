import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class UserXP(Base):
    __tablename__ = "user_xp"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    xp = Column(Integer, default=0)
    points = Column(Integer, default=0)
    level_index = Column(Integer, default=1)
    level_name = Column(String(50), default="Starter")
    streak_days = Column(Integer, default=1)

    # Relationships
    user = relationship("User", back_populates="xp_record")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(String(255), nullable=False)
    xp_reward = Column(Integer, default=100)
    icon_name = Column(String(50), default="star")

    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement", cascade="all, delete-orphan")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")


class ChallengeMission(Base):
    __tablename__ = "challenge_missions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(255), nullable=False)
    category = Column(String(50), default="saving")  # saving, transaction, digital, card
    current_progress = Column(Float, default=0.0)
    target_progress = Column(Float, default=100.0)
    unit = Column(String(20), default="₦")
    xp_reward = Column(Integer, default=200)
    points_reward = Column(Integer, default=250)
    status = Column(String(30), default="active")  # active, completed, claimed
    is_first_mission = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    points_cost = Column(Integer, nullable=False)
    category = Column(String(50), default="perk") # airtime, voucher, perk, merch
    value_display = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)

class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reward_id = Column(Integer, ForeignKey("rewards.id", ondelete="CASCADE"), nullable=False)
    points_spent = Column(Integer, nullable=False)
    status = Column(String(50), default="completed")
    code = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    reward = relationship("Reward")
