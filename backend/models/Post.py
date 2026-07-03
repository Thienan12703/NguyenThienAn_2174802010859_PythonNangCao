from beanie import Document, Link
from pydantic import Field
from datetime import datetime
from typing import Optional
from models.User import User

class Post(Document):
    title: str
    slug: str
    content: str
    thumbnail: Optional[str] = None
    author: Optional[Link[User]] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "posts"
