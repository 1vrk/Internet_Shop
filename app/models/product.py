from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Product(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    price = Column(DECIMAL(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    image_url = Column(String(255))
    
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    category = relationship("Category", back_populates="products")