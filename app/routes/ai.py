"""
Module AI - Tích hợp Gemini API thông qua urllib và json (Python stdlib).
Tuân thủ CLO3: Lập trình mạng Internet, sử dụng urllib.request để gửi HTTP request
và module json để xử lý dữ liệu JSON, KHÔNG dùng SDK bên thứ ba.
"""
import json
import os
import urllib.request
import urllib.error

from flask import Blueprint, request, jsonify
from app import db
from app.models import Product, Review

ai_bp = Blueprint('ai', __name__)

GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'


def call_gemini_api(prompt: str) -> str:
    """
    Gọi Gemini API sử dụng urllib.request (HTTP POST thuần Python).

    Quy trình:
    1. Tạo payload dạng dict Python rồi chuyển thành chuỗi JSON bằng json.dumps().
    2. Gửi HTTP POST request tới Gemini REST API thông qua urllib.request.
    3. Đọc response body và phân tích JSON bằng json.loads().
    4. Trả về nội dung văn bản được AI sinh ra.

    Returns:
        str: Văn bản do Gemini tạo ra.
    Raises:
        Exception: Nếu có lỗi mạng hoặc API trả về lỗi.
    """
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise Exception('GEMINI_API_KEY chưa được cấu hình trong biến môi trường.')

    is_groq = api_key.startswith('gsk_')

    if is_groq:
        # Sử dụng Groq API (chuẩn OpenAI)
        url = 'https://api.groq.com/openai/v1/chat/completions'
        payload = {
            "model": "llama3-8b-8192",
            "messages": [{"role": "user", "content": prompt}]
        }
        headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': f'Bearer {api_key}'
        }
    else:
        # Sử dụng Gemini API
        url = f'{GEMINI_API_URL}?key={api_key}'
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        headers = {
            'Content-Type': 'application/json; charset=utf-8',
        }

    # Chuyển dict Python → chuỗi JSON rồi encode sang bytes UTF-8
    payload_bytes = json.dumps(payload, ensure_ascii=False).encode('utf-8')

    # Hỗ trợ proxy của PythonAnywhere free tier
    proxy_url = os.environ.get('HTTP_PROXY') or os.environ.get('HTTPS_PROXY')
    if proxy_url:
        proxy_handler = urllib.request.ProxyHandler({
            'http': proxy_url,
            'https': proxy_url
        })
        opener = urllib.request.build_opener(proxy_handler)
    else:
        opener = urllib.request.build_opener()

    req = urllib.request.Request(
        url=url,
        data=payload_bytes,
        headers=headers,
        method='POST'
    )

    # Gửi request qua opener (có thể dùng proxy) và đọc response
    with opener.open(req, timeout=30) as response:
        response_body = response.read().decode('utf-8')

    # Phân tích JSON response để lấy văn bản kết quả
    data = json.loads(response_body)
    
    if is_groq:
        return data['choices'][0]['message']['content']
    else:
        return data['candidates'][0]['content']['parts'][0]['text']


@ai_bp.route('/generate-description', methods=['POST'])
def generate_description():
    """
    Endpoint sinh mô tả sản phẩm tự động bằng Gemini API.
    Nhận: JSON body với trường 'name' và 'brand'.
    Trả về: JSON với trường 'description'.
    """
    data = request.get_json()
    name = data.get('name', '').strip()
    brand = data.get('brand', '').strip()

    if not name:
        return jsonify({'error': 'Tên sản phẩm là bắt buộc.'}), 400

    try:
        prompt = (
            f"Viết một đoạn mô tả chuẩn SEO, hấp dẫn để bán sản phẩm cầu lông "
            f"có tên: {name}, thương hiệu: {brand}. "
            f"Chỉ trả về đoạn văn mô tả, không thêm bất kỳ nội dung nào khác."
        )
        description = call_gemini_api(prompt)
        return jsonify({'description': description})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/summarize-reviews/<int:product_id>', methods=['GET'])
def summarize_reviews(product_id):
    """
    Endpoint tóm tắt đánh giá sản phẩm bằng Gemini API.
    Nhận: product_id từ URL.
    Trả về: JSON với trường 'summary'.
    """
    product = Product.query.get(product_id)
    if not product or not product.reviews.count():
        return jsonify({'summary': 'Chưa có đủ đánh giá để tóm tắt.'})

    # Xây dựng chuỗi đánh giá để đưa vào prompt
    reviews_text = "\n".join(
        [f"- {r.rating} sao: {r.comment}" for r in product.reviews.all()]
    )

    try:
        prompt = (
            f"Dưới đây là các đánh giá của khách hàng về sản phẩm {product.name}. "
            f"Hãy tóm tắt ngắn gọn trong 2-3 câu xem người dùng thích hay không thích điểm gì:\n"
            f"{reviews_text}"
        )
        summary = call_gemini_api(prompt)
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/search', methods=['POST'])
def search():
    """
    Endpoint tìm kiếm ngữ nghĩa bằng Gemini API.
    AI phân tích câu hỏi tự nhiên và trả về danh sách ID sản phẩm phù hợp.
    Nhận: JSON body với trường 'query'.
    Trả về: JSON với trường 'ai_ids' (chuỗi ID phân cách bằng dấu phẩy).
    """
    data = request.get_json()
    query = data.get('query', '').strip()

    if not query:
        return jsonify({'error': 'Nội dung tìm kiếm là bắt buộc.'}), 400

    try:
        products = Product.query.all()
        # Chuẩn bị danh sách sản phẩm chi tiết để AI phân tích
        product_info = "\n".join([
            f"ID: {p.id}, Tên: {p.name}, Thương hiệu: {p.brand.name if p.brand else 'N/A'}, "
            f"Danh mục: {p.category.name if p.category else 'N/A'}, "
            f"Giá: {p.price} VND, Mô tả: {(p.description or '')[:60]}"
            for p in products
        ])

        prompt = (
            f"Bạn là hệ thống tìm kiếm ngữ nghĩa thông minh của một cửa hàng cầu lông.\n"
            f"Danh sách sản phẩm:\n{product_info}\n\n"
            f"Người dùng tìm kiếm: \"{query}\"\n\n"
            f"Nhiệm vụ: Phân tích yêu cầu (giá, màu sắc, loại, thương hiệu...) và tìm các sản phẩm phù hợp nhất.\n"
            f"CHỈ trả về danh sách ID phân cách bằng dấu phẩy (ví dụ: 1, 3, 5). "
            f"Nếu không có sản phẩm nào phù hợp, trả về chuỗi rỗng. Không thêm bất kỳ chữ nào khác."
        )

        result_text = call_gemini_api(prompt)

        # Lọc chỉ lấy chữ số và dấu phẩy để đảm bảo an toàn
        clean_result = "".join([c for c in result_text.strip() if c.isdigit() or c == ','])
        return jsonify({'ai_ids': clean_result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
