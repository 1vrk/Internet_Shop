from sqlalchemy.orm import Session
from app import models, schemas
from typing import List

def get_payment_method(db: Session, method_id: int) -> models.PaymentMethod | None:
    return db.query(models.PaymentMethod).filter(models.PaymentMethod.id == method_id).first()

def get_all_payment_methods(db: Session) -> List[models.PaymentMethod]:
    return db.query(models.PaymentMethod).all()

def create_payment_method(db: Session, method_in: schemas.PaymentMethodCreate) -> models.PaymentMethod:
    db_method = models.PaymentMethod(name=method_in.name, is_active=method_in.is_active)
    db.add(db_method)
    db.commit()
    db.refresh(db_method)
    return db_method

def update_payment_method(
    db: Session, db_method: models.PaymentMethod, method_in: schemas.PaymentMethodCreate
) -> models.PaymentMethod:
    db_method.name = method_in.name
    db_method.is_active = method_in.is_active
    db.commit()
    db.refresh(db_method)
    return db_method

def delete_payment_method(db: Session, db_method: models.PaymentMethod):
    db.delete(db_method)
    db.commit()

def get_active_payment_methods(db: Session) -> List[models.PaymentMethod]:
    return db.query(models.PaymentMethod).filter(models.PaymentMethod.is_active == True).all()