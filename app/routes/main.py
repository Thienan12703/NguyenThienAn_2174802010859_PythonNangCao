from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, session
from flask_login import login_required, current_user
from app.models import Product, Category, Post, Order, OrderItem, Review
from app.forms import CheckoutForm, ReviewForm
from app import db

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    products = Product.query.limit(8).all()
    categories = Category.query.all()
    return render_template('main/index.html', products=products, categories=categories)

@main_bp.route('/products')
def products():
    page = request.args.get('page', 1, type=int)
    keyword = request.args.get('keyword', '')
    category_id = request.args.get('category_id', type=int)
    
    query = Product.query
    if keyword:
        query = query.filter(Product.name.ilike(f'%{keyword}%'))
    if category_id:
        query = query.filter_by(category_id=category_id)
        
    pagination = query.paginate(page=page, per_page=12, error_out=False)
    categories = Category.query.all()
    
    return render_template('main/products.html', 
                           products=pagination.items, 
                           pagination=pagination, 
                           categories=categories,
                           keyword=keyword,
                           category_id=category_id)

@main_bp.route('/product/<int:id>', methods=['GET', 'POST'])
def product(id):
    product = Product.query.get_or_404(id)
    form = ReviewForm()
    
    if form.validate_on_submit():
        if not current_user.is_authenticated:
            flash('Vui lòng đăng nhập để đánh giá.', 'warning')
            return redirect(url_for('auth.login'))
            
        review = Review(rating=form.rating.data, comment=form.comment.data, 
                        author=current_user, product=product)
        db.session.add(review)
        db.session.commit()
        flash('Đánh giá của bạn đã được gửi.', 'success')
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

@main_bp.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    cart_items = session.get('cart', {})
    if not cart_items:
        flash('Giỏ hàng trống.', 'warning')
        return redirect(url_for('main.index'))
        
    form = CheckoutForm()
    if form.validate_on_submit():
        total = sum(Product.query.get(int(pid)).price * qty for pid, qty in cart_items.items())
        order = Order(
            customer=current_user,
            shipping_address=form.address.data,
            payment_method=form.payment_method.data,
            total_price=total
        )
        db.session.add(order)
        db.session.commit() # To get order ID
        
        for pid, qty in cart_items.items():
            p = Product.query.get(int(pid))
            item = OrderItem(order=order, product=p, quantity=qty, price=p.price)
            db.session.add(item)
            
        db.session.commit()
        session.pop('cart', None)
        flash('Đặt hàng thành công!', 'success')
        
        # Optionally send email here (CLO2 requirement)
        # send_order_email(order)
        
        return redirect(url_for('main.my_orders'))
        
    return render_template('main/checkout.html', form=form)

@main_bp.route('/my_orders')
@login_required
def my_orders():
    orders = current_user.orders.order_by(Order.timestamp.desc()).all()
    return render_template('main/my_orders.html', orders=orders)

@main_bp.route('/posts')
def posts():
    posts = Post.query.order_by(Post.timestamp.desc()).all()
    return render_template('main/posts.html', posts=posts)
