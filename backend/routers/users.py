from fastapi import APIRouter, Depends, HTTPException
from models.User import User
from core.dependencies import get_current_admin
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

class UserRoleUpdate(BaseModel):
    role: str

@router.get("/")
async def get_users(current_user: User = Depends(get_current_admin)):
    users = await User.find_all().to_list()
    return users

@router.delete("/{id}")
async def delete_user(id: str, current_user: User = Depends(get_current_admin)):
    user = await User.get(ObjectId(id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"message": "User removed"}

@router.get("/{id}")
async def get_user_by_id(id: str, current_user: User = Depends(get_current_admin)):
    user = await User.get(ObjectId(id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{id}")
async def update_user(id: str, req: UserRoleUpdate, current_user: User = Depends(get_current_admin)):
    user = await User.get(ObjectId(id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = req.role
    await user.save()
    return user
