from fastapi import APIRouter
from app.api.endpoints import auth, users, categories, products, cart, addresses, orders, admin, reviews, payment_methods

api_router = APIRouter()


api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

api_router.include_router(users.router, prefix="/users", tags=["Users"])

api_router.include_router(addresses.router, prefix="/addresses", tags=["Addresses"]) 

api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])

api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])

api_router.include_router(categories.router, prefix="/categories", tags=["Categories"]) 

api_router.include_router(products.router, prefix="/products", tags=["Products"]) 

api_router.include_router(payment_methods.router, prefix="/payment-methods", tags=["Payment Methods"])

api_router.include_router(cart.router, prefix="/cart", tags=["Cart"])