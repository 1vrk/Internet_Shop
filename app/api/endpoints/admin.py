from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud, models
from app.api import dependencies
from app.db.session import get_db

router = APIRouter()


@router.get("/orders", response_model=List[schemas.Order])
def read_all_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    return crud.crud_order.get_all_orders(db)

@router.put("/orders/{order_id}/status", response_model=schemas.Order)
def update_order_status(
    order_id: int,
    status_in: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    order = crud.crud_order.get_order_by_id(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return crud.crud_order.update_order_status(db, order=order, new_status=status_in)

@router.get("/users", response_model=List[schemas.User])
def read_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    return crud.crud_user.get_all_users(db)


# ... (в конце файла)

# --- Управление Способами Оплаты ---

@router.get("/payment-methods", response_model=List[schemas.PaymentMethod])
def read_all_payment_methods(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    return crud.crud_payment_method.get_all_payment_methods(db)

@router.post("/payment-methods", response_model=schemas.PaymentMethod, status_code=201)
def create_payment_method(
    method_in: schemas.PaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    return crud.crud_payment_method.create_payment_method(db, method_in=method_in)

@router.put("/payment-methods/{method_id}", response_model=schemas.PaymentMethod)
def update_payment_method(
    method_id: int,
    method_in: schemas.PaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_method = crud.crud_payment_method.get_payment_method(db, method_id=method_id)
    if not db_method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    return crud.crud_payment_method.update_payment_method(db, db_method=db_method, method_in=method_in)

@router.delete("/payment-methods/{method_id}", status_code=204)
def delete_payment_method(
    method_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_method = crud.crud_payment_method.get_payment_method(db, method_id=method_id)
    if not db_method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    crud.crud_payment_method.delete_payment_method(db, db_method=db_method)
    return


@router.delete("/reviews/{review_id}", status_code=204)
def delete_review_by_admin(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_review = crud.crud_review.get_review_by_id(db, review_id=review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    crud.crud_review.delete_review(db, db_review=db_review)
    return