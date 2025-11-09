from sqlalchemy.orm import Session
from app import models, schemas
from typing import List

def get_reviews_by_product(db: Session, product_id: int) -> List[models.Review]:
    return db.query(models.Review).filter(models.Review.product_id == product_id).all()

def create_review(
    db: Session, review: schemas.ReviewCreate, product_id: int, user_id: int
) -> models.Review:
    db_review = models.Review(
        **review.dict(), 
        product_id=product_id, 
        user_id=user_id
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_review_by_id(db: Session, review_id: int) -> models.Review | None:
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def delete_review(db: Session, db_review: models.Review):
    db.delete(db_review)
    db.commit()