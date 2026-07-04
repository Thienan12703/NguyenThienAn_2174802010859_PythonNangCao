from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from models.Post import Post
from models.User import User
from core.dependencies import get_current_admin
from bson import ObjectId
from typing import Optional

router = APIRouter()

class PostCreate(BaseModel):
    title: str
    slug: str
    content: str
    thumbnail: Optional[str] = None

@router.get("/")
async def get_posts():
    posts = await Post.find_all().to_list()
    return posts

@router.get("/{id}")
async def get_post_by_id(id: str):
    post = await Post.get(ObjectId(id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_post(post_in: PostCreate, current_user: User = Depends(get_current_admin)):
    post = Post(
        title=post_in.title,
        slug=post_in.slug,
        content=post_in.content,
        thumbnail=post_in.thumbnail,
        author=current_user.id
    )
    await post.insert()
    return post

@router.put("/{id}")
async def update_post(id: str, post_in: PostCreate, current_user: User = Depends(get_current_admin)):
    post = await Post.get(ObjectId(id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.title = post_in.title
    post.slug = post_in.slug
    post.content = post_in.content
    if post_in.thumbnail:
        post.thumbnail = post_in.thumbnail
        
    await post.save()
    return post

@router.delete("/{id}")
async def delete_post(id: str, current_user: User = Depends(get_current_admin)):
    post = await Post.get(ObjectId(id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await post.delete()
    return {"message": "Post deleted successfully"}
