from sqlalchemy.orm import Session
from app import models, schemas
from typing import List

def get_reviews_by_product(db: Session, product_id: int) -> List[models.Review]:
    return db.query(models.Review).filter(models.Review.product_id == product_id).all()

def get_all_reviews_count(db: Session):
    return db.query(models.Review).count()

def get_all_reviews(db: Session, skip: int = 0, limit: int = 100) -> List[models.Review]:
    return db.query(models.Review).order_by(models.Review.created_at.desc()).offset(skip).limit(limit).all()

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

def update_review(
    db: Session, db_review: models.Review, review_in: schemas.ReviewCreate
) -> models.Review:
    db_review.rating = review_in.rating
    db_review.comment = review_in.comment
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_review_by_id(db: Session, review_id: int) -> models.Review | None:
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def delete_review(db: Session, db_review: models.Review):
    db.delete(db_review)
    db.commit()


def get_review_by_user_and_product(db: Session, user_id: int, product_id: int) -> models.Review | None:
    return db.query(models.Review).filter(
        models.Review.user_id == user_id,
        models.Review.product_id == product_id
    ).first()

def delete_review(db: Session, db_review: models.Review):
    db.delete(db_review)
    db.commit()