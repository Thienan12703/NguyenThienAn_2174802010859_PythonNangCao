from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from models.Product import Product, Review
from models.User import User
from core.dependencies import get_current_user, get_current_admin
from bson import ObjectId
from typing import List

router = APIRouter()

class ReviewCreate(BaseModel):
    rating: int
    comment: str

from typing import Optional

from bson import ObjectId
from models.Category import Category

@router.get("/")
async def get_products(keyword: Optional[str] = None):
    if keyword:
        products = await Product.find({"name": {"$regex": keyword, "$options": "i"}}).to_list()
    else:
        products = await Product.find_all().to_list()
    
    # Populate category manually
    for p in products:
        if isinstance(p.category, (str, ObjectId)):
            cat = await Category.get(ObjectId(p.category))
            if cat:
                p.category = cat
    return products

@router.get("/{id}")
async def get_product(id: str):
    try:
        product = await Product.get(ObjectId(id))
        if product:
            if isinstance(product.category, (str, ObjectId)):
                cat = await Category.get(ObjectId(product.category))
                if cat:
                    product.category = cat
            return product
    except:
        pass
    raise HTTPException(status_code=404, detail="Product not found")

@router.post("/{id}/reviews", status_code=status.HTTP_201_CREATED)
async def create_product_review(id: str, review_in: ReviewCreate, current_user: User = Depends(get_current_user)):
    product = await Product.get(ObjectId(id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already reviewed (handle both old Mongoose ObjectId and new embedded formats)
    already_reviewed = False
    for r in product.reviews:
        r_user_id = r.user.id if hasattr(r.user, "id") else (r.user.get("_id") if isinstance(r.user, dict) else str(r.user))
        if str(r_user_id) == str(current_user.id):
            already_reviewed = True
            break
            
    if already_reviewed:
        raise HTTPException(status_code=400, detail="Product already reviewed")

    review = Review(
        user=current_user.id,
        name=current_user.name,
        rating=review_in.rating,
        comment=review_in.comment
    )
    product.reviews.append(review)
    product.numReviews = len(product.reviews)
    product.rating = sum([r.rating for r in product.reviews]) / product.numReviews
    
    await product.save()
    return {"message": "Review added"}

# Admin routes for products
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(product_in: Product, current_user: User = Depends(get_current_admin)):
    await product_in.insert()
    return product_in

@router.put("/{id}")
async def update_product(id: str, product_in: Product, current_user: User = Depends(get_current_admin)):
    product = await Product.get(ObjectId(id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_in.id = product.id
    await product_in.replace()
    return product_in

@router.delete("/{id}")
async def delete_product(id: str, current_user: User = Depends(get_current_admin)):
    product = await Product.get(ObjectId(id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await product.delete()
    return {"message": "Product removed"}
