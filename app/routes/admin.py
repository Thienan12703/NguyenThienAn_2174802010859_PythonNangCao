import os
import time
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app.models import Product, Category, Brand, Order, User, Post, Banner, ContactMessage
from app.forms import ProductForm, BrandForm, CategoryForm, OrderStatusForm, BannerForm, PostForm
from app import db
from functools import wraps
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('Bạn không có quyền truy cập trang này.', 'danger')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/')
@admin_required
def dashboard():
    total_orders = Order.query.count()
    total_products = Product.query.count()
    total_users = User.query.count()
    
    # Low stock products (<= 5)
    low_stock_products = Product.query.filter(Product.stock <= 5).all()
    
    # Recent contact messages
    recent_messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(5).all()
    
    # Chart data (Orders per day for last 7 days)
    today = datetime.utcnow().date()
    dates = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(6, -1, -1)]
    order_counts = []
    
    for d in dates:
        start = datetime.strptime(d, '%Y-%m-%d')
        end = start + timedelta(days=1)
        count = Order.query.filter(Order.timestamp >= start, Order.timestamp < end).count()
        order_counts.append(count)
        
    return render_template('admin/dashboard.html', 
                           total_orders=total_orders, 
                           total_products=total_products, 
                           total_users=total_users,
                           low_stock_products=low_stock_products,
                           recent_messages=recent_messages,
                           chart_labels=dates,
                           chart_data=order_counts)

@admin_bp.route('/products')
@admin_required
def products():
    page = request.args.get('page', 1, type=int)
    pagination = Product.query.paginate(page=page, per_page=10, error_out=False)
    return render_template('admin/products.html', products=pagination.items, pagination=pagination)

def handle_image_uploads(files):
    images_list = []
    if not files:
        return images_list
    for file in files:
        if file and hasattr(file, 'filename') and file.filename:
            filename = secure_filename(file.filename)
            unique_name = f"{int(time.time())}_{filename}"
            upload_path = os.path.join('app', 'static', 'uploads', unique_name)
            file.save(upload_path)
            images_list.append(url_for('static', filename=f'uploads/{unique_name}'))
    return images_list

@admin_bp.route('/product/new', methods=['GET', 'POST'])
@admin_required
def new_product():
    form = ProductForm()
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    form.brand_id.choices = [(b.id, b.name) for b in Brand.query.all()]
    if form.validate_on_submit():
        images_list = handle_image_uploads(form.images.data)
        
        product = Product(
            name=form.name.data,
            price=form.price.data,
            images=images_list,
            brand_id=form.brand_id.data,
            category_id=form.category_id.data,
            description=form.description.data,
            stock=form.stock.data
        )
        db.session.add(product)
        db.session.commit()
        flash('Thêm sản phẩm thành công!', 'success')
        return redirect(url_for('admin.products'))
    return render_template('admin/product_form.html', form=form, title="Thêm Sản Phẩm")

@admin_bp.route('/product/edit/<int:id>', methods=['GET', 'POST'])
@admin_required
def edit_product(id):
    product = Product.query.get_or_404(id)
    form = ProductForm(obj=product)
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    form.brand_id.choices = [(b.id, b.name) for b in Brand.query.all()]
    
    if form.validate_on_submit():
        new_images = handle_image_uploads(form.images.data)
        if new_images:
            product.images = new_images # Replace existing images if new ones are uploaded
            
        product.name = form.name.data
        product.price = form.price.data
        product.brand_id = form.brand_id.data
        product.category_id = form.category_id.data
        product.description = form.description.data
        product.stock = form.stock.data
        db.session.commit()
        flash('Cập nhật sản phẩm thành công!', 'success')
        return redirect(url_for('admin.products'))
        
    return render_template('admin/product_form.html', form=form, title="Sửa Sản Phẩm")

@admin_bp.route('/product/delete/<int:id>', methods=['POST'])
@admin_required
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    flash('Đã xóa sản phẩm.', 'success')
    return redirect(url_for('admin.products'))

# --- BRANDS ---
@admin_bp.route('/brands')
@admin_required
def brands():
    brands = Brand.query.all()
    return render_template('admin/brands.html', brands=brands)

@admin_bp.route('/brand/new', methods=['GET', 'POST'])
@admin_required
def new_brand():
    form = BrandForm()
    if form.validate_on_submit():
        brand = Brand(name=form.name.data, slug=form.name.data.lower().replace(' ', '-'))
        db.session.add(brand)
        db.session.commit()
        flash('Thêm thương hiệu thành công!', 'success')
        return redirect(url_for('admin.brands'))
    return render_template('admin/brand_form.html', form=form, title="Thêm Thương Hiệu")

@admin_bp.route('/brand/delete/<int:id>', methods=['POST'])
@admin_required
def delete_brand(id):
    brand = Brand.query.get_or_404(id)
    db.session.delete(brand)
    db.session.commit()
    flash('Đã xóa thương hiệu.', 'success')
    return redirect(url_for('admin.brands'))

# --- ORDERS ---
@admin_bp.route('/orders')
@admin_required
def orders():
    page = request.args.get('page', 1, type=int)
    pagination = Order.query.order_by(Order.timestamp.desc()).paginate(page=page, per_page=10, error_out=False)
    return render_template('admin/orders.html', orders=pagination.items, pagination=pagination)

@admin_bp.route('/order/<int:id>', methods=['GET', 'POST'])
@admin_required
def order_detail(id):
    order = Order.query.get_or_404(id)
    form = OrderStatusForm(obj=order)
    if form.validate_on_submit():
        order.status = form.status.data
        order.payment_status = form.payment_status.data
        db.session.commit()
        flash('Cập nhật trạng thái đơn hàng thành công!', 'success')
        return redirect(url_for('admin.order_detail', id=order.id))
    return render_template('admin/order_detail.html', order=order, form=form)

# --- BANNERS ---
@admin_bp.route('/banners')
@admin_required
def banners():
    banners = Banner.query.all()
    return render_template('admin/banners.html', banners=banners)

@admin_bp.route('/banner/new', methods=['GET', 'POST'])
@admin_required
def new_banner():
    form = BannerForm()
    if form.validate_on_submit():
        image_url = None
        images = request.files.getlist(form.image.name)
        if images and images[0].filename:
            saved_paths = handle_image_uploads(images)
            if saved_paths:
                image_url = saved_paths[0]
                
        banner = Banner(title=form.title.data, image=image_url, link=form.link.data, is_active=form.is_active.data)
        db.session.add(banner)
        db.session.commit()
        flash('Thêm Banner thành công!', 'success')
        return redirect(url_for('admin.banners'))
    return render_template('admin/banner_form.html', form=form, title="Thêm Banner")

@admin_bp.route('/banner/delete/<int:id>', methods=['POST'])
@admin_required
def delete_banner(id):
    banner = Banner.query.get_or_404(id)
    db.session.delete(banner)
    db.session.commit()
    flash('Đã xóa Banner.', 'success')
    return redirect(url_for('admin.banners'))

# --- POSTS ---
@admin_bp.route('/posts')
@admin_required
def posts():
    page = request.args.get('page', 1, type=int)
    pagination = Post.query.order_by(Post.timestamp.desc()).paginate(page=page, per_page=10, error_out=False)
    return render_template('admin/posts.html', posts=pagination.items, pagination=pagination)

@admin_bp.route('/post/new', methods=['GET', 'POST'])
@admin_required
def new_post():
    form = PostForm()
    if form.validate_on_submit():
        thumb_url = None
        images = request.files.getlist(form.thumbnail.name)
        if images and images[0].filename:
            saved_paths = handle_image_uploads(images)
            if saved_paths:
                thumb_url = saved_paths[0]
                
        post = Post(
            title=form.title.data, 
            slug=form.title.data.lower().replace(' ', '-'),
            thumbnail=thumb_url,
            content=form.content.data,
            user_id=current_user.id
        )
        db.session.add(post)
        db.session.commit()
        flash('Thêm bài viết thành công!', 'success')
        return redirect(url_for('admin.posts'))
    return render_template('admin/post_form.html', form=form, title="Thêm Bài Viết")

@admin_bp.route('/post/delete/<int:id>', methods=['POST'])
@admin_required
def delete_post(id):
    post = Post.query.get_or_404(id)
    db.session.delete(post)
    db.session.commit()
    flash('Đã xóa bài viết.', 'success')
    return redirect(url_for('admin.posts'))
