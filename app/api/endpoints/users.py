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