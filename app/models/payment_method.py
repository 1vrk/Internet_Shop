from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)