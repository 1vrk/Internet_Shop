from pydantic import BaseModel, EmailStr, Field 
from typing import Optional, Annotated
from .user_profile import UserProfile

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: Annotated[str, Field(min_length=8, max_length=72)]

class User(UserBase):
    id: int
    is_admin: bool
    profile: Optional[UserProfile] = None
    class Config:
        from_attributes  = True 


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None