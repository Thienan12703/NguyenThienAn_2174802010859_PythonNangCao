from pydantic import Field, EmailStr
from beanie import Document
from datetime import datetime
from typing import Optional

class User(Document):
    name: str
    email: EmailStr
    password: str
    role: str = "user" # 'user' or 'admin'
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
