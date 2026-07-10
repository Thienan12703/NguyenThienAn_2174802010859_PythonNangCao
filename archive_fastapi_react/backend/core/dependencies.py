from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from core.security import SECRET_KEY, ALGORITHM
from models.User import User
from bson import ObjectId

# Dùng OAuth2PasswordBearer, nhưng frontend hiện tại của bạn dùng token truyền trong Header 
# (Authorization: Bearer <token>). OAuth2PasswordBearer sẽ tự đọc từ header đó.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authorized, token failed",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    try:
        user = await User.get(ObjectId(user_id))
        if user is None:
            raise credentials_exception
        return user
    except Exception:
        raise credentials_exception

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized as an admin")
    return current_user
