import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.User import User
from models.Product import Product
from models.Order import Order
from models.Category import Category
from models.Post import Post

# Vá lỗi tương thích giữa Motor và Beanie
if not hasattr(AsyncIOMotorClient, 'append_metadata'):
    setattr(AsyncIOMotorClient, 'append_metadata', lambda self, *args, **kwargs: None)

import beanie.odm.queries.find as find
_original_get_cursor = find.FindMany.get_cursor

async def _patched_get_cursor(self):
    cursor = self.document_model.get_pymongo_collection().aggregate(
        self.build_aggregation_pipeline(), session=self.session
    )
    # Motor >= 3.4 returns a cursor directly, not an awaitable
    if hasattr(cursor, '__await__'):
        return await cursor
    return cursor

find.FindMany.get_cursor = _patched_get_cursor

async def init_db():
    mongodb_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/badminton-shop")
    # Tách database name từ URI (nếu có)
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.get_database("badminton-shop")
    if "/" in mongodb_uri.split("mongodb://")[-1] or "/" in mongodb_uri.split("mongodb+srv://")[-1]:
        db = client.get_default_database()
        
    await init_beanie(database=db, document_models=[User, Category, Product, Order, Post])
