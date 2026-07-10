import uuid
from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, session
from flask_login import login_required, current_user
from flask_mail import Message
from app.models import Product, Category, Post, Order, OrderItem, Review, Banner, Brand
from app.forms import CheckoutForm, ReviewForm
from app import db, mail

main_bp = Blueprint('main', __name__)

def send_order_email(to_email, order):
    """Gửi email xác nhận đơn hàng có chứa mã vận đơn."""
    try:
        subject = f'SmashPro - Xác nhận đơn hàng #{order.id}'
        body = f"""
        Xin chào!

        Đơn hàng #{order.id} của bạn đã được đặt thành công.
        Mã vận đơn của bạn là: {order.tracking_code}

        Bạn có thể theo dõi tình trạng đơn hàng tại:
        {url_for('main.track', _external=True)}

        Chi tiết đơn hàng:
        - Địa chỉ giao hàng: {order.shipping_address}
        - Hình thức thanh toán: {order.payment_method}
        - Tổng tiền: {'{:,.0f}'.format(order.total_price)} đ

        Cảm ơn bạn đã tin tưởng mua sắm tại SmashPro!
        """
        msg = Message(
            subject=subject,
            recipients=[to_email],
            body=body
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.warning(f'Không thể gửi email xác nhận: {e}')

@main_bp.route('/')
def index():
    products = Product.query.limit(8).all()
    categories = Category.query.all()
    banners = Banner.query.filter_by(is_active=True).all()
    return render_template('main/index.html', products=products, categories=categories, banners=banners)

@main_bp.route('/products')
def products():
    page = request.args.get('page', 1, type=int)
    keyword = request.args.get('keyword', '')
    
    # Handle multiple selections
    category_ids = request.args.getlist('category_id', type=int)
    brand_ids = request.args.getlist('brand_id', type=int)
    ai_ids = request.args.get('ai_ids', '')
    
    query = Product.query
    if keyword:
        query = query.filter(Product.name.ilike(f'%{keyword}%'))
        
    if category_ids:
        query = query.filter(Product.category_id.in_(category_ids))
        
    if brand_ids:
        query = query.filter(Product.brand_id.in_(brand_ids))
        
    if ai_ids:
        ids_list = [int(id.strip()) for id in ai_ids.split(',') if id.strip().isdigit()]
        if ids_list:
            query = query.filter(Product.id.in_(ids_list))
        
    pagination = query.paginate(page=page, per_page=12, error_out=False)
    categories = Category.query.all()
    brands = Brand.query.all()
    
    return render_template('main/products.html', 
                           products=pagination.items, 
                           pagination=pagination,
                           categories=categories,
                           brands=brands,
                           selected_categories=category_ids,
                           selected_brands=brand_ids,
                           keyword=keyword,
                           ai_ids=ai_ids)

@main_bp.route('/product/<int:id>', methods=['GET', 'POST'])
def product(id):
    product = Product.query.get_or_404(id)
    form = ReviewForm()
    
    if form.validate_on_submit():
        if not current_user.is_authenticated:
            flash('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ Ä‘Ã¡nh giÃ¡.', 'warning')
            return redirect(url_for('auth.login'))
            
        review = Review(rating=form.rating.data, comment=form.comment.data, 
                        author=current_user, product=product)
        db.session.add(review)
        db.session.commit()
        flash('ÄÃ¡nh giÃ¡ cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c gá»­i.', 'success')
        return redirect(url_for('main.product', id=product.id))
        
    reviews = product.reviews.order_by(Review.timestamp.desc()).all()
    return render_template('main/product_detail.html', product=product, form=form, reviews=reviews)

@main_bp.route('/cart')
def cart():
    cart_items = session.get('cart', {})
    products = []
    total = 0
    for prod_id, qty in cart_items.items():
        p = Product.query.get(int(prod_id))
        if p:
            products.append({'product': p, 'quantity': qty})
            total += p.price * qty
    return render_template('main/cart.html', cart_items=products, total=total)

@main_bp.route('/add_to_cart/<int:id>', methods=['POST'])
def add_to_cart(id):
    qty = int(request.form.get('quantity', 1))
    cart = session.get('cart', {})
    str_id = str(id)
    if str_id in cart:
        cart[str_id] += qty
    else:
        cart[str_id] = qty
    session['cart'] = cart
    flash('Đã thêm vào giỏ hàng!', 'success')
    return redirect(url_for('main.cart'))

@main_bp.route('/remove_from_cart/<int:id>', methods=['POST'])
def remove_from_cart(id):
    cart = session.get('cart', {})
    str_id = str(id)
    if str_id in cart:
        del cart[str_id]
        session['cart'] = cart
        flash('Đã xóa sản phẩm khỏi giỏ hàng.', 'success')
    return redirect(url_for('main.cart'))

@main_bp.route('/checkout', methods=['GET', 'POST'])
def checkout():
    cart_items = session.get('cart', {})
    if not cart_items:
        flash('Giỏ hàng trống.', 'warning')
        return redirect(url_for('main.index'))
        
    form = CheckoutForm()
    
    # Pre-fill form if logged in
    if current_user.is_authenticated and request.method == 'GET':
        form.fullname.data = getattr(current_user, 'fullname', '') or current_user.username
        form.email.data = getattr(current_user, 'email', '')
        form.phone.data = getattr(current_user, 'phone', '')
        form.address.data = getattr(current_user, 'address', '')
        
    if form.validate_on_submit():
        total = sum(Product.query.get(int(pid)).price * qty for pid, qty in cart_items.items())
        
        # Generate a tracking code
        tracking_code = 'SP-' + uuid.uuid4().hex[:8].upper()
        
        order = Order(
            tracking_code=tracking_code,
            shipping_address=form.address.data,
            payment_method=form.payment_method.data,
            notes=form.notes.data,
            total_price=total
        )
        
        if current_user.is_authenticated:
            order.user_id = current_user.id
        else:
            order.guest_name = form.fullname.data
            order.guest_phone = form.phone.data
            order.guest_email = form.email.data
            
        db.session.add(order)
        db.session.commit() # To get order ID
        
        for pid, qty in cart_items.items():
            p = Product.query.get(int(pid))
            item = OrderItem(order=order, product=p, quantity=qty, price=p.price)
            db.session.add(item)
            
        db.session.commit()
        session.pop('cart', None)
        
        # Gửi email xác nhận đơn hàng
        recipient = current_user.email if current_user.is_authenticated else form.email.data
        send_order_email(recipient, order)
        
        return render_template('main/order_success.html', order=order)
        
    return render_template('main/checkout.html', form=form, cart_items=cart_items)

@main_bp.route('/my_orders')
@login_required
def my_orders():
    orders = current_user.orders.order_by(Order.timestamp.desc()).all()
    return render_template('main/my_orders.html', orders=orders)

@main_bp.route('/posts')
def posts():
    posts = Post.query.order_by(Post.timestamp.desc()).all()
    return render_template('main/posts.html', posts=posts)

@main_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    from app.models import ContactMessage
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        message = request.form.get('message')
        
        if name and email and message:
            new_msg = ContactMessage(name=name, email=email, phone=phone, message=message)
            db.session.add(new_msg)
            db.session.commit()
            flash('Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!', 'success')
        else:
            flash('Vui lòng điền đầy đủ các trường bắt buộc.', 'danger')
            
        return redirect(url_for('main.contact'))
    return render_template('main/contact.html')

@main_bp.route('/track', methods=['GET', 'POST'])
def track():
    order = None
    if request.method == 'POST':
        tracking_code = request.form.get('tracking_code', '').strip()
        if tracking_code:
            order = Order.query.filter_by(tracking_code=tracking_code).first()
            if not order:
                flash('Không tìm thấy đơn hàng với mã vận đơn này.', 'danger')
        else:
            flash('Vui lòng nhập mã vận đơn.', 'warning')
    return render_template('main/track_order.html', order=order)
