from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from models.User import User
from core.security import verify_password, get_password_hash, create_access_token
from core.dependencies import get_current_user
from typing import Any

router = APIRouter()

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister):
    user_exists = await User.find_one(User.email == user_in.email)
    if user_exists:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = User(
        name=user_in.name,
        email=user_in.email,
        password=get_password_hash(user_in.password)
    )
    await user.insert()
    
    return {
        "_id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "token": create_access_token({"id": str(user.id)})
    }

@router.post("/login")
async def login(user_in: UserLogin):
    user = await User.find_one(User.email == user_in.email)
    if user and verify_password(user_in.password, user.password):
        return {
            "_id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "token": create_access_token({"id": str(user.id)})
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@router.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "_id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }

@router.put("/profile")
async def update_user_profile(user_in: UserProfileUpdate, current_user: User = Depends(get_current_user)):
    if user_in.name:
        current_user.name = user_in.name
    if user_in.email:
        current_user.email = user_in.email
    if user_in.password:
        current_user.password = get_password_hash(user_in.password)
        
    await current_user.save()
    return {
        "_id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "token": create_access_token({"id": str(current_user.id)})
    }
