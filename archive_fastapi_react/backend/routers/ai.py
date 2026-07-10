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

class GenerateDescRequest(BaseModel):
    name: str
    brand: str

@router.post("/generate-description")
async def generate_description(req: GenerateDescRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GEMINI_API_KEY.")
    
    client = genai.Client(api_key=api_key)
    prompt = f"Viết một đoạn mô tả sản phẩm (dành cho website thương mại điện tử) bán đồ cầu lông. Tên sản phẩm: '{req.name}', Thương hiệu: '{req.brand}'. Viết khoảng 3-4 đoạn, văn phong hấp dẫn, chuẩn SEO, có liệt kê các ưu điểm nổi bật. Chỉ trả về nội dung mô tả, không cần tiêu đề."
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"description": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SummarizeReviewsRequest(BaseModel):
    reviews: list[str]

@router.post("/summarize-reviews")
async def summarize_reviews(req: SummarizeReviewsRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GEMINI_API_KEY.")
    if not req.reviews:
        return {"summary": "Chưa có đủ đánh giá để tóm tắt."}
    
    client = genai.Client(api_key=api_key)
    reviews_text = "\n".join([f"- {r}" for r in req.reviews])
    prompt = f"Dưới đây là các đánh giá của khách hàng về một sản phẩm cầu lông:\n{reviews_text}\n\nHãy tóm tắt ngắn gọn trong 2-3 câu về cảm nhận chung của khách hàng (khen/chê điểm nào nhiều nhất)."
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"summary": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SmartSearchRequest(BaseModel):
    query: str

@router.post("/smart-search")
async def smart_search(req: SmartSearchRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GEMINI_API_KEY.")
    
    client = genai.Client(api_key=api_key)
    
    products = await Product.find_all().to_list()
    product_context = "\n".join([f"ID: {str(p.id)} | Tên: {p.name} | Giá: {p.price} | Hãng: {p.brand}" for p in products])
    
    system_prompt = f"""
    Bạn là hệ thống tìm kiếm thông minh của cửa hàng cầu lông.
    Dưới đây là danh sách sản phẩm:
    {product_context}
    
    Người dùng tìm kiếm: "{req.query}"
    Hãy chọn ra TỐI ĐA 5 ID sản phẩm phù hợp nhất với nhu cầu của họ.
    CHỈ trả về kết quả là một mảng chuỗi JSON chứa các ID. Không giải thích gì thêm.
    Ví dụ: ["66c3...111", "66c3...222"]
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=system_prompt,
        )
        
        # Parse output as JSON
        import json
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        try:
            ids = json.loads(text)
        except:
            ids = []
            
        if not ids:
            return {"products": []}
            
        from bson import ObjectId
        obj_ids = [ObjectId(i) for i in ids if len(i) == 24]
        
        if obj_ids:
            matched_products = await Product.find({"_id": {"$in": obj_ids}}).to_list()
            # Manually populate category since it was needed
            from models.Category import Category
            for p in matched_products:
                if isinstance(p.category, (str, ObjectId)):
                    cat = await Category.get(ObjectId(p.category))
                    if cat:
                        p.category = cat
            return {"products": matched_products}
        return {"products": []}
    except Exception as e:
        print("Smart Search Error:", e)
        return {"products": []}
