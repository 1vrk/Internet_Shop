from sqlalchemy.orm import Session
from app import models, schemas

def get_addresses_by_user(db: Session, user_id: int):
    return db.query(models.Address).filter(models.Address.user_id == user_id).all()

def create_address(db: Session, address: schemas.AddressCreate, user_id: int):
    db_address = models.Address(**address.dict(), user_id=user_id)
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

def get_address_by_id(db: Session, address_id: int) -> models.Address | None:
    return db.query(models.Address).filter(models.Address.id == address_id).first()

def update_address(
    db: Session, db_address: models.Address, address_in: schemas.AddressCreate
) -> models.Address:
    update_data = address_in.dict()
    for field, value in update_data.items():
        setattr(db_address, field, value)
    
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

def delete_address(db: Session, db_address: models.Address):
    db.delete(db_address)
    db.commit()