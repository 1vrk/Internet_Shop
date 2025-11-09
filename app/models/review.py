from sqlalchemy import Column, Integer, Text, ForeignKey, TIMESTAMP, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    __table_args__ = (CheckConstraint('rating >= 1 AND rating <= 5', name='rating_check'),)
    
    user = relationship("User")
    product = relationship("Product")