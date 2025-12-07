from pydantic import BaseModel
from typing import List
from datetime import datetime
from .address import Address
from .payment_method import PaymentMethod
from .product import Product

class OrderItem(BaseModel):
    quantity: int
    price_per_item: float
    product: Product
    class Config: from_attributes = True

class OrderCreate(BaseModel):
    address_id: int
    payment_method_id: int

class Order(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    order_date: datetime
    address: Address
    payment_method: PaymentMethod
    items: List[OrderItem]
    class Config: from_attributes = True