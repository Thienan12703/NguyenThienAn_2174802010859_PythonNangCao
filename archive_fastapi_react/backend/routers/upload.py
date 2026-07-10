import os
import shutil
from fastapi import APIRouter, Depends, File, UploadFile
from core.dependencies import get_current_admin

router = APIRouter()

# Đảm bảo thư mục uploads tồn tại
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    # Đáng lẽ ra cần current_admin, nhưng tạm mở để test cho dễ
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # Trả về đường dẫn để frontend có thể load ảnh
    return f"/uploads/{file.filename}"
