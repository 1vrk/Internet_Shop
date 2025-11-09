from sqlalchemy.orm import Session
from app import models, schemas

def update_profile(
    db: Session, db_profile: models.UserProfile, profile_in: schemas.UserProfileUpdate
) -> models.UserProfile:
    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile