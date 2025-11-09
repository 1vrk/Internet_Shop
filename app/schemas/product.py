from pydantic import BaseModel, Field
from typing import Optional
from .category import Category 

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0) 
    stock_quantity: int = Field(..., ge=0) 
    image_url: Optional[str] = None
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    category: Category 

    class Config:
        from_attributes = True