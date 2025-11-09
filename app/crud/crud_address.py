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