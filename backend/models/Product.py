from beanie import Document, Link
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Any
from models.Category import Category
from models.User import User

class Review(BaseModel):
    user: Any
    name: str
    rating: int
    comment: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Product(Document):
    name: str
    price: float
    image: str
    images: List[str] = []
    brand: str
    category: Any
    description: str
    stock: int = 0
    isFeatured: bool = False
    rating: float = 0.0
    numReviews: int = 0
    reviews: List[Review] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "products"
