from fastapi import APIRouter, Depends, HTTPException
from app import schemas, models, crud 
from app.api import dependencies
from pydantic import EmailStr 
from app.schemas.user import UserUpdate
from sqlalchemy.orm import Session 
from app.db.session import get_db

router = APIRouter()



@router.get("/me", response_model=schemas.User)
def read_current_user(
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return current_user


@router.put("/me", response_model=schemas.User)
def update_current_user(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return crud.crud_user.update_user(db, db_user=current_user, user_in=user_in)

@router.put("/me/profile", response_model=schemas.UserProfile)
def update_current_user_profile(
    profile_in: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if not current_user.profile:
         raise HTTPException(status_code=404, detail="Profile not found")
    return crud.crud_user_profile.update_profile(
        db, db_profile=current_user.profile, profile_in=profile_in
    )

@router.get("/me/can-review/{product_id}")
def can_user_review(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    purchased = crud.crud_order.has_user_purchased_product(
        db=db, user_id=current_user.id, product_id=product_id
    )

    existing_review = crud.crud_review.get_review_by_user_and_product(
        db=db, user_id=current_user.id, product_id=product_id
    )

    already_reviewed = existing_review is not None

    can_review = purchased and not already_reviewed
    
    return {"can_review": can_review}