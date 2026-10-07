import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class SavingsPlan(Base):
    __tablename__ = "savings_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    duration_months = Column(Integer, default=6)  # 1, 2, 3, 4, 6, 9, 12, 18, 24, 36
    bank = Column(String(100), default="GTBank")  # Nigerian bank selected
    status = Column(String(30), default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="savings_plans")
