from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud, models
from app.api import dependencies
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Address])
def read_user_addresses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return crud.crud_address.get_addresses_by_user(db, user_id=current_user.id)

@router.post("/", response_model=schemas.Address, status_code=201)
def create_address(
    address_in: schemas.AddressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return crud.crud_address.create_address(db, address=address_in, user_id=current_user.id)