from sqlalchemy.orm import Session
from app import models, schemas

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name, description=category.description)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, db_category: models.Category, category_in: schemas.CategoryUpdate):
    db_category.name = category_in.name
    db_category.description = category_in.description
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, db_category: models.Category):
    db.delete(db_category)
    db.commit()
    return db_category