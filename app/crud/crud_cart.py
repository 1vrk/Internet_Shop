from sqlalchemy.orm import Session
from app import models, schemas

def get_cart_items_by_user(db: Session, user_id: int):
    return db.query(models.Cart).filter(models.Cart.user_id == user_id).all()

def get_cart_item(db: Session, user_id: int, product_id: int):
    return db.query(models.Cart).filter(
        models.Cart.user_id == user_id,
        models.Cart.product_id == product_id
    ).first()

def add_item_to_cart(db: Session, item: schemas.CartItemCreate, user_id: int):
    db_item = get_cart_item(db, user_id=user_id, product_id=item.product_id)
    
    if db_item:
        db_item.quantity += item.quantity
    else:
        db_item = models.Cart(**item.dict(), user_id=user_id)
        db.add(db_item)
        
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item_quantity(db: Session, db_item: models.Cart, quantity: int):
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