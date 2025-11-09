from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    phone_number = Column(String(20))
    user = relationship("User", back_populates="profile")