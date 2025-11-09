from pydantic import BaseModel, Field
from typing import List, Optional

from .product import Product


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0) 

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItem(BaseModel):
    id: int
    quantity: int
    product: Product 

    class Config:
        from_attributes = True

class Cart(BaseModel):
    items: List[CartItem]
    total_cost: float