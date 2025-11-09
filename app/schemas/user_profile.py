from pydantic import BaseModel
from typing import Optional

class UserProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    user_id: int
    class Config: from_attributes = True