from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas, crud
from app.db.session import get_db

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user_by_email = crud.crud_user.get_user_by_email(db, email=user_in.email)
    if user_by_email:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким email уже существует.",
        )
    
    user_by_username = crud.crud_user.get_user_by_username(db, username=user_in.username)
    if user_by_username:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким именем уже существует.",
        )
    
    new_user = crud.crud_user.create_user(db=db, user=user_in)
    return new_user