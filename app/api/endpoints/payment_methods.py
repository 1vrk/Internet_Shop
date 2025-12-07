from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.PaymentMethod])
def read_active_payment_methods(db: Session = Depends(get_db)):
    return crud.crud_payment_method.get_active_payment_methods(db)