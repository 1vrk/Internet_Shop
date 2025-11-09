from pydantic import BaseModel
from typing import Optional

class AddressBase(BaseModel):
    street: str
    city: str
    state: Optional[str] = None
    postal_code: str
    country: str

class AddressCreate(AddressBase):
    pass

class Address(AddressBase):
    id: int
    user_id: int
    class Config: from_attributes = True