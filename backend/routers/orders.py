from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from models.Order import Order, OrderItem, ShippingAddress
from models.User import User
from core.dependencies import get_current_user, get_current_admin
from bson import ObjectId
from typing import List
from datetime import datetime
from models.Product import Product

async def populate_order(order):
    if isinstance(order.user, (str, ObjectId)):
        user = await User.get(ObjectId(order.user))
        if user:
            order.user = user
    for item in order.items:
        if isinstance(item.product, (str, ObjectId)):
            prod = await Product.get(ObjectId(item.product))
            if prod:
                item.product = prod
    return order

router = APIRouter()

class OrderCreate(BaseModel):
    orderItems: List[OrderItem]
    shippingAddress: ShippingAddress
    paymentMethod: str
    itemsPrice: float
    taxPrice: float
    shippingPrice: float
    totalPrice: float

@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_order_items(order_in: OrderCreate, current_user: User = Depends(get_current_user)):
    if not order_in.orderItems or len(order_in.orderItems) == 0:
        raise HTTPException(status_code=400, detail="No order items")
    
    # Ensure order items store product as ObjectId, not string
    for item in order_in.orderItems:
        if isinstance(item.product, str):
            item.product = ObjectId(item.product)

    order = Order(
        user=current_user.id,
        items=order_in.orderItems,
        shippingAddress=order_in.shippingAddress,
        paymentMethod=order_in.paymentMethod,
        totalPrice=order_in.totalPrice
    )
    await order.insert()
    return order

@router.get("/myorders")
async def get_my_orders(current_user: User = Depends(get_current_user)):
    orders = await Order.find(Order.user == current_user.id).to_list()
    for o in orders:
        await populate_order(o)
    return orders

@router.get("/{id}")
async def get_order_by_id(id: str, current_user: User = Depends(get_current_user)):
    order = await Order.get(ObjectId(id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await populate_order(order)
    return order

@router.put("/{id}/pay")
async def update_order_to_paid(id: str, current_user: User = Depends(get_current_user)):
    order = await Order.get(ObjectId(id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.paymentStatus = "Paid"
    order.paidAt = datetime.utcnow()
    await order.save()
    return order

# Admin routes
@router.get("/")
async def get_orders(current_user: User = Depends(get_current_admin)):
    orders = await Order.find_all().to_list()
    for o in orders:
        await populate_order(o)
    return orders

@router.put("/{id}/deliver")
async def update_order_to_delivered(id: str, current_user: User = Depends(get_current_admin)):
    order = await Order.get(ObjectId(id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = "Hoàn thành"
    await order.save()
    return order
