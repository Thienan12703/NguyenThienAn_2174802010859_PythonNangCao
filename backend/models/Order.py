from beanie import Document, Link
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Any
from models.Product import Product
from models.User import User

class OrderItem(BaseModel):
    product: Any
    quantity: int
    price: float

class ShippingAddress(BaseModel):
    fullName: str
    phone: str
    address: str

class Order(Document):
    user: Any
    items: List[OrderItem]
    totalPrice: float
    shippingAddress: ShippingAddress
    paymentMethod: str = "COD"
    paymentStatus: str = "Pending"
    paidAt: Optional[datetime] = None
    status: str = "Chờ xử lý"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"
