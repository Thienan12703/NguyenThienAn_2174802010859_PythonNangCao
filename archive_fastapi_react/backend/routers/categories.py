from fastapi import APIRouter, Depends, HTTPException, status
from models.Category import Category
from models.User import User
from core.dependencies import get_current_admin
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def get_categories():
    categories = await Category.find_all().to_list()
    return categories

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_category(category_in: Category, current_user: User = Depends(get_current_admin)):
    await category_in.insert()
    return category_in

@router.put("/{id}")
async def update_category(id: str, category_in: Category, current_user: User = Depends(get_current_admin)):
    category = await Category.get(ObjectId(id))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category_in.id = category.id
    await category_in.replace()
    return category_in

@router.delete("/{id}")
async def delete_category(id: str, current_user: User = Depends(get_current_admin)):
    category = await Category.get(ObjectId(id))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    await category.delete()
    return {"message": "Category removed"}
