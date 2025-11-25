from sqlalchemy.orm import Session
from app import models, schemas
from fastapi import HTTPException


def get_cart_items_by_user(db: Session, user_id: int):
    return db.query(models.Cart).filter(models.Cart.user_id == user_id).all()

def get_cart_item(db: Session, user_id: int, product_id: int):
    return db.query(models.Cart).filter(
        models.Cart.user_id == user_id,
        models.Cart.product_id == product_id
    ).first()

def add_item_to_cart(db: Session, item: schemas.CartItemCreate, user_id: int):    
    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_item = get_cart_item(db, user_id=user_id, product_id=item.product_id)
    
    current_quantity_in_cart = 0
    if db_item:
        current_quantity_in_cart = db_item.quantity
        
    total_desired_quantity = current_quantity_in_cart + item.quantity
    
    if total_desired_quantity > product.stock_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Невозможно добавить {item.quantity} шт. На складе осталось "
                   f"{product.stock_quantity - current_quantity_in_cart} шт. для добавления."
        )

    if db_item:
        db_item.quantity += item.quantity
    else:
        db_item = models.Cart(**item.dict(), user_id=user_id)
        db.add(db_item)
        
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item_quantity(db: Session, db_item: models.Cart, quantity: int):
    product = db_item.product 

    if quantity > product.stock_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Невозможно установить количество {quantity} шт. "
                   f"Всего на складе: {product.stock_quantity} шт."
        )

    db_item.quantity = quantity
    db.commit()
    db.refresh(db_item)
    return db_item

def remove_item_from_cart(db: Session, db_item: models.Cart):
    db.delete(db_item)
    db.commit()

def clear_user_cart(db: Session, user_id: int):
    db.query(models.Cart).filter(models.Cart.user_id == user_id).delete()
    db.commit()