from sqlalchemy.orm import Session
from app.models.user import User
from app import models
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import create_hashed_password, verify_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = create_hashed_password(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        profile=models.UserProfile() 
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    update_data = user_in.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str)-> User | None:
    user = get_user_by_username(db, username=username)
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()