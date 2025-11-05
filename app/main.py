from fastapi import FastAPI
from app.api.api import api_router

app = FastAPI(
    title="PokéShop API",
    description="API для интернет-магазина покемонов",
    version="0.1.0"
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to PokéShop API!"}

