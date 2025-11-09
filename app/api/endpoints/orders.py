from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud, models
from app.api import dependencies
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Order])
def read_user_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return crud.crud_order.get_orders_by_user(db, user_id=current_user.id)

@router.post("/", response_model=schemas.Order, status_code=201)
def create_order(
    order_in: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return crud.crud_order.create_order(db, order_in=order_in, user_id=current_user.id)