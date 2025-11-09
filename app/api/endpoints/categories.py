from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud, models
from app.api import dependencies
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.crud_category.get_categories(db, skip=skip, limit=limit)

@router.get("/{category_id}", response_model=schemas.Category)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.crud_category.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


#для админa
@router.post("/", response_model=schemas.Category, status_code=201)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_category = crud.crud_category.get_category_by_name(db, name=category.name)
    if db_category:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    return crud.crud_category.create_category(db=db, category=category)

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category_in: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_category = crud.crud_category.get_category(db, category_id=category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.crud_category.update_category(db, db_category=db_category, category_in=category_in)

@router.delete("/{category_id}", response_model=schemas.Category)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_category = crud.crud_category.get_category(db, category_id=category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.crud_category.delete_category(db, db_category=db_category)