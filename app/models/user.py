from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from app.db.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")