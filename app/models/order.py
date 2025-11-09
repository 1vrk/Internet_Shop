from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, TIMESTAMP, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=False)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    status = Column(Enum('pending', 'processing', 'shipped', 'delivered', 'cancelled', name='order_status_enum'), default='pending', nullable=False)
    order_date = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User")
    address = relationship("Address")
    payment_method = relationship("PaymentMethod")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_item = Column(DECIMAL(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")