from fastapi import APIRouter, Depends, HTTPException, status
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


@router.put("/{address_id}", response_model=schemas.Address)
def update_address(
    address_id: int,
    address_in: schemas.AddressCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    address = crud.crud_address.get_address_by_id(db, address_id=address_id)
    
    if not address or address.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Address not found"
        )
    
    return crud.crud_address.update_address(db, db_address=address, address_in=address_in)

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    address = crud.crud_address.get_address_by_id(db, address_id=address_id)
    
    if not address or address.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Address not found"
        )
    
    crud.crud_address.delete_address(db, db_address=address)
    return