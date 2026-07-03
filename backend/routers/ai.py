import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from models.Product import Product

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def ai_chat(req: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GEMINI_API_KEY trong biến môi trường.")
    
    client = genai.Client(api_key=api_key)
    
    # Retrieve some product info to give context to Gemini
    products = await Product.find_all().limit(20).to_list()
    product_context = "\n".join([f"- Tên: {p.name} (Hãng: {p.brand}, Giá: {p.price}, Tồn kho: {p.stock}). Mô tả: {p.description}" for p in products])
    
    system_prompt = f"""
    Bạn là một trợ lý ảo chuyên nghiệp, am hiểu về cầu lông, đang làm việc cho cửa hàng 'Badminton Shop MERN' (nay đổi sang Python).
    Dưới đây là danh sách một số sản phẩm hiện có trong cửa hàng:
    {product_context}
    
    Hãy trả lời câu hỏi của khách hàng một cách thân thiện, tư vấn tận tình như một chuyên gia. 
    Nếu khách hỏi về sản phẩm có trong danh sách, hãy tư vấn chi tiết dựa trên thông tin đó.
    Nếu không có, hãy khuyên họ liên hệ trực tiếp cửa hàng hoặc đưa ra lời khuyên chung về cầu lông.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=req.message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
            ),
        )
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
