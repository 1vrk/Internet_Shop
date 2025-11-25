from app.db.base import Base 
from app.db.session import engine 
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.category import Category
from app.models.product import Product
from app.models.cart import Cart
from app.models.address import Address
from app.models.payment_method import PaymentMethod
from app.models.order import Order, OrderItem
from app.models.review import Review

def init_db():
    print("хз не не чекал")
    Base.metadata.create_all(bind=engine)
    print("таблицы созданы или уже существовали")