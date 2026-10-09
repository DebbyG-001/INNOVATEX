import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    limit_amount = Column(Integer, nullable=False)
    color = Column(String(20), default="bg-[#3B82F6]")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
