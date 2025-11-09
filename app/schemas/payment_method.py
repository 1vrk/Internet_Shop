from pydantic import BaseModel

class PaymentMethodBase(BaseModel):
    name: str
    is_active: bool = True

class PaymentMethodCreate(PaymentMethodBase):
    pass

class PaymentMethod(PaymentMethodBase):
    id: int
    class Config: from_attributes = True