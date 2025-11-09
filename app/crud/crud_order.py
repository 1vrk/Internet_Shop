from sqlalchemy.orm import Session
from app import models, schemas
from app.crud import crud_cart, crud_product
from fastapi import HTTPException

def get_orders_by_user(db: Session, user_id: int):
    return db.query(models.Order).filter(models.Order.user_id == user_id).all()

def create_order(db: Session, order_in: schemas.OrderCreate, user_id: int):
    cart_items = crud_cart.get_cart_items_by_user(db, user_id=user_id)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = sum(item.product.price * item.quantity for item in cart_items)

    db_order = models.Order(
        user_id=user_id,
        address_id=order_in.address_id,
        payment_method_id=order_in.payment_method_id,
        total_amount=total_amount,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in cart_items:
        if item.product.stock_quantity < item.quantity:
             raise HTTPException(status_code=400, detail=f"Not enough stock for {item.product.name}")

        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_per_item=item.product.price
        )
        db.add(db_order_item)
        
        product = crud_product.get_product(db, product_id=item.product_id)
        product.stock_quantity -= item.quantity
        db.add(product)

    crud_cart.clear_user_cart(db, user_id=user_id)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order_by_id(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def update_order_status(db: Session, order: models.Order, new_status: str):
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status value")
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order

def has_user_purchased_product(db: Session, user_id: int, product_id: int) -> bool:
    order_item = db.query(models.OrderItem).join(models.Order).filter(
        models.Order.user_id == user_id,
        models.OrderItem.product_id == product_id,
        models.Order.status == 'delivered'
    ).first() 
    return order_item is not None