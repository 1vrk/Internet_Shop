from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from .user import User

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="рейтинг от 1 до 5")
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass 

class Review(ReviewBase):
    id: int
    user: User 
    created_at: datetime

    class Config:
        from_attributes = True 