import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(20), nullable=False)  # credit or debit
    action_type = Column(String(50), nullable=False)  # transfer, bill_payment, airtime, saving_transfer, money_received, funding
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    recipient = Column(String(255), nullable=True)
    reference = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(30), default="successful")
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
