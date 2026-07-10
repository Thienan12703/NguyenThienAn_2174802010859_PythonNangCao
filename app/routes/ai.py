from flask import Blueprint, request, jsonify
from google import genai
from app import db
from app.models import Product, Review
import os

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate-description', methods=['POST'])
def generate_description():
    data = request.get_json()
    name = data.get('name')
    brand = data.get('brand')
    
    if not name:
        return jsonify({'error': 'Product name is required'}), 400
        
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'Gemini API Key is missing'}), 500
        
    try:
        client = genai.Client(api_key=api_key)
        prompt = f"Viết một đoạn mô tả chuẩn SEO, hấp dẫn để bán sản phẩm cầu lông có tên: {name}, thương hiệu: {brand}. Chỉ trả về đoạn văn mô tả."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return jsonify({'description': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/summarize-reviews/<int:product_id>', methods=['GET'])
def summarize_reviews(product_id):
    product = Product.query.get(product_id)
    if not product or not product.reviews.count():
        return jsonify({'summary': 'Chưa có đủ đánh giá để tóm tắt.'})
        
    reviews_text = "\n".join([f"- {r.rating} sao: {r.comment}" for r in product.reviews.all()])
    
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'Gemini API Key is missing'}), 500
        
    try:
        client = genai.Client(api_key=api_key)
        prompt = f"Dưới đây là các đánh giá của khách hàng về sản phẩm {product.name}. Hãy tóm tắt ngắn gọn trong 2-3 câu xem người dùng thích hay không thích điểm gì:\n{reviews_text}"
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return jsonify({'summary': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
