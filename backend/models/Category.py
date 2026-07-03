from beanie import Document
from datetime import datetime
from pydantic import Field
from typing import Optional

class Category(Document):
    name: str
    slug: str
    description: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "categories"
