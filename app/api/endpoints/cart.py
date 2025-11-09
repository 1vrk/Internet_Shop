from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, crud, models
from app.api import dependencies
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=schemas.Cart)
def read_user_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    cart_items_db = crud.crud_cart.get_cart_items_by_user(db, user_id=current_user.id)
    
    total_cost = sum(item.product.price * item.quantity for item in cart_items_db)
    
    return {"items": cart_items_db, "total_cost": total_cost}


@router.post("/items", response_model=schemas.CartItem)
def add_item_to_cart(
    item_in: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    product = crud.crud_product.get_product(db, product_id=item_in.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock_quantity < item_in.quantity:
        raise HTTPException(status_code=400, detail="Not enough items in stock")
    
    cart_item = crud.crud_cart.add_item_to_cart(db=db, item=item_in, user_id=current_user.id)
    return cart_item


@router.put("/items/{product_id}", response_model=schemas.CartItem)
def update_cart_item(
    product_id: int,
    item_in: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_item = crud.crud_cart.get_cart_item(db, user_id=current_user.id, product_id=product_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    if db_item.product.stock_quantity < item_in.quantity:
         raise HTTPException(status_code=400, detail="Not enough items in stock")

    return crud.crud_cart.update_item_quantity(db, db_item=db_item, quantity=item_in.quantity)


@router.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cart_item(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_item = crud.crud_cart.get_cart_item(db, user_id=current_user.id, product_id=product_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
        
    crud.crud_cart.remove_item_from_cart(db, db_item=db_item)
    return 