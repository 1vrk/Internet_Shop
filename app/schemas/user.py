from pydantic import BaseModel, EmailStr, Field 
from typing import Optional, Annotated

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: Annotated[str, Field(min_length=8, max_length=72)]

class User(UserBase):
    id: int
    is_admin: bool

    class Config:
        from_attributes  = True 