import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False) # Electricity, Airtime/Data, Internet, Cable TV, Water, Other
    amount = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=False)
    recurrence = Column(String(50), nullable=False, default="Monthly") # Once, Weekly, Monthly, Yearly
    status = Column(String(30), default="pending") # pending, paid
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bills")
