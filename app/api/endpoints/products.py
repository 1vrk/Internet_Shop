from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import schemas, crud, models
from app.api import dependencies
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None
):
    return crud.crud_product.get_products(
        db, skip=skip, limit=limit, category_id=category_id, search=search
    )

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.crud_product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

#для админa
@router.post("/", response_model=schemas.Product, status_code=201)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_category = crud.crud_category.get_category(db, category_id=product.category_id)
    if not db_category:
        raise HTTPException(status_code=400, detail=f"Category with id {product.category_id} does not exist")
    return crud.crud_product.create_product(db=db, product=product)

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product_in: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_product = crud.crud_product.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return crud.crud_product.update_product(db, db_product=db_product, product_in=product_in)

@router.delete("/{product_id}", response_model=schemas.Product)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    db_product = crud.crud_product.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return crud.crud_product.delete_product(db, db_product=db_product)



@router.get("/{product_id}/reviews", response_model=List[schemas.Review])
def read_product_reviews(product_id: int, db: Session = Depends(get_db)):
    product = crud.crud_product.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return crud.crud_review.get_reviews_by_product(db, product_id=product_id)


@router.post("/{product_id}/reviews", response_model=schemas.Review, status_code=201)
def create_product_review(
    product_id: int,
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    product = crud.crud_product.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    #чекаем, покупал ли текущий пользователь этот товар, тут это мэйн вещь 
    if not crud.crud_order.has_user_purchased_product(db, user_id=current_user.id, product_id=product_id):
        raise HTTPException(
            status_code=403, # 403 Forbidden - правильный статус для этой ситуации
            detail="You can only review products you have purchased"
        )

    return crud.crud_review.create_review(
        db, review=review_in, product_id=product_id, user_id=current_user.id
    )