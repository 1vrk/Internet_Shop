from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, crud, models
from app.api import dependencies
from app.db.session import get_db

router = APIRouter()


@router.get("/reviews", response_model=list[schemas.Review])
def read_all_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    return crud.crud_review.get_all_reviews(db)

@router.put("/{review_id}", response_model=schemas.Review)
def update_own_review(
    review_id: int,
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    review = crud.crud_review.get_review_by_id(db, review_id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="отзыв не найден")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="нет прав")
        
    return crud.crud_review.update_review(db, db_review=review, review_in=review_in)

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_own_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    review = crud.crud_review.get_review_by_id(db, review_id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="отзыв не найден")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="нет прав")

    crud.crud_review.delete_review(db, db_review=review)
    return