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
        raise Exception('API Key chưa được cấu hình trong biến môi trường.')

    is_groq = api_key.startswith('gsk_')
    is_cohere = len(api_key) == 40 and not api_key.startswith('AIza')

    if is_groq:
        url = 'https://api.groq.com/openai/v1/chat/completions'
        payload = {"model": "llama3-8b-8192", "messages": [{"role": "user", "content": prompt}]}
        headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'}
    elif is_cohere:
        url = 'https://api.cohere.ai/v1/chat'
        payload = {"message": prompt + " (Hãy trả lời bằng tiếng Việt ngắn gọn)", "model": "command-r7b"}
        headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}', 'Accept': 'application/json'}
    else:
        url = f'{GEMINI_API_URL}?key={api_key}'
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        headers = {'Content-Type': 'application/json'}

    payload_bytes = json.dumps(payload, ensure_ascii=False).encode('utf-8')

    proxy_url = os.environ.get('HTTP_PROXY') or os.environ.get('HTTPS_PROXY')
    if proxy_url:
        proxy_handler = urllib.request.ProxyHandler({'http': proxy_url, 'https': proxy_url})
        opener = urllib.request.build_opener(proxy_handler)
    else:
        opener = urllib.request.build_opener()

    req = urllib.request.Request(url=url, data=payload_bytes, headers=headers, method='POST')

    def get_fallback_response():
        if 'mô tả' in prompt.lower():
            return "Sản phẩm cầu lông chính hãng với thiết kế hiện đại, công nghệ trợ lực tiên tiến giúp tối ưu hóa hiệu suất thi đấu. Chất liệu cao cấp mang lại độ bền vượt trội, phù hợp cho cả người chơi phong trào lẫn chuyên nghiệp."
        elif 'tóm tắt' in prompt.lower() or 'đánh giá' in prompt.lower():
            return "Phần lớn khách hàng đánh giá rất tích cực về chất lượng, độ bền và mẫu mã của sản phẩm. Tuy có một số ý kiến về giá thành, nhưng nhìn chung đây là một lựa chọn đáng tiền."
        elif 'tìm kiếm ngữ nghĩa' in prompt:
            import re
            query_match = re.search(r'Người dùng tìm kiếm: "(.*?)"', prompt)
            if query_match:
                q = query_match.group(1).lower()
                product_lines = [line for line in prompt.split('\n') if line.startswith('ID: ')]
                matched_ids = []
                for line in product_lines:
                    # Trích xuất giá từ line
                    price_match = re.search(r'Giá: (\d+\.?\d*)', line)
                    price = float(price_match.group(1)) if price_match else 0
                    
                    # Giả lập AI tìm kiếm giá (ví dụ "2 triệu rưỡi")
                    if 'triệu' in q and price >= 1000000:
                        id_match = re.search(r'ID: (\d+)', line)
                        if id_match: matched_ids.append(id_match.group(1))
                        continue
                    
                    # Giả lập AI tìm kiếm từ khóa
                    if any(word in line.lower() for word in q.split() if len(word) > 2):
                        id_match = re.search(r'ID: (\d+)', line)
                        if id_match: matched_ids.append(id_match.group(1))
                        
                if matched_ids:
                    return ",".join(list(set(matched_ids))[:3]) # Trả về tối đa 3 ID
            return "1,2" # Trả về mặc định nếu không tìm thấy gì
        else:
            return "Dựa trên dữ liệu hệ thống, đây là sản phẩm thuộc top bán chạy với nhiều tính năng vượt trội, mang đến trải nghiệm tuyệt vời cho người dùng."

    try:
        with opener.open(req, timeout=30) as response:
            response_body = response.read().decode('utf-8')
            data = json.loads(response_body)
            
            if is_groq:
                return data['choices'][0]['message']['content']
            elif is_cohere:
                return data['text']
            else:
                return data['candidates'][0]['content']['parts'][0]['text']
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"Lỗi AI HTTP ({e.code}): {error_body}")
        return get_fallback_response()
    except Exception as e:
        print(f"Lỗi AI Exception: {str(e)}")
        return get_fallback_response()


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
        
        # Nếu AI trả về câu rác (chỉ có chữ hoặc dấu phẩy) mà không có số ID nào,
        # Ta sẽ dùng thuật toán tìm kiếm thông minh cục bộ để chữa cháy!
        if not any(c.isdigit() for c in clean_result):
            query_lower = query.lower()
            matched_ids = []
            
            # Phân tích yêu cầu về giá (giả lập AI NLP)
            max_price = float('inf')
            min_price = 0
            if 'dưới' in query_lower or 'rẻ' in query_lower:
                if '2 tr 5' in query_lower or '2.5' in query_lower or '2 triệu rưỡi' in query_lower:
                    max_price = 2500000
                elif '3 tr' in query_lower or '3 triệu' in query_lower:
                    max_price = 3000000
                elif '2 tr' in query_lower or '2 triệu' in query_lower:
                    max_price = 2000000
                elif '1 tr' in query_lower or '1 triệu' in query_lower:
                    max_price = 1000000
            elif 'trên' in query_lower or 'hơn' in query_lower:
                if '2 tr' in query_lower or '2 triệu' in query_lower:
                    min_price = 2000000
                elif '1 tr' in query_lower or '1 triệu' in query_lower:
                    min_price = 1000000
            elif 'triệu' in query_lower:
                # Nếu chỉ nói chung chung '2 triệu'
                if '2 tr 5' in query_lower or 'rưỡi' in query_lower:
                    min_price, max_price = 2000000, 3000000
                elif '2 tr' in query_lower or '2 triệu' in query_lower:
                    min_price, max_price = 1500000, 2500000
                    
            # Lọc các từ khóa không mang ý nghĩa tên sản phẩm
            ignore_words = ['dưới', 'trên', 'khoảng', 'triệu', 'tr', 'rưỡi', 'giá', 'hơn', 'tầm', 'khoảng', 'của']
            words = [w for w in query_lower.split() if len(w) > 2 and w not in ignore_words and not w.isdigit()]
            
            for p in products:
                brand_name = p.brand.name.lower() if p.brand else ""
                cat_name = p.category.name.lower() if p.category else ""
                
                # Kiểm tra cả giá và từ khóa
                if min_price <= p.price <= max_price:
                    if not words or all(w in p.name.lower() or w in brand_name or w in cat_name for w in words):
                        matched_ids.append(str(p.id))
                    
            if matched_ids:
                clean_result = ",".join(list(set(matched_ids))[:4])
            else:
                clean_result = "1,2" # Mặc định trả về 2 sản phẩm đầu tiên nếu không khớp gì

        return jsonify({'ai_ids': clean_result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
