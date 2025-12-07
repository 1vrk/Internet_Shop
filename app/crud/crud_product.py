from sqlalchemy.orm import Session
from app import models, schemas
from typing import Optional, List

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def get_products_count(db: Session, category_id: Optional[int] = None, search: Optional[str] = None):
    query = db.query(models.Product)
    if category_id: 
        query = query.filter(models.Product.category_id == category_id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Product.name.ilike(search_term)) | 
            (models.Product.description.ilike(search_term))
        )
    return query.count()


def get_products(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = None,
    search: Optional[str] = None
):
    query = db.query(models.Product)
    
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Product.name.ilike(search_term)) | 
            (models.Product.description.ilike(search_term))
        )
        
    return query.offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, db_product: models.Product, product_in: schemas.ProductUpdate):
    update_data = product_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, db_product: models.Product):
    db.delete(db_product)
    db.commit()
    return db_product

