from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from app.models import Product, Category, Order, User
from app.forms import ProductForm
from app import db
from functools import wraps

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
    return render_template('admin/dashboard.html', 
                           total_orders=total_orders, 
                           total_products=total_products, 
                           total_users=total_users)

@admin_bp.route('/products')
@admin_required
def products():
    page = request.args.get('page', 1, type=int)
    pagination = Product.query.paginate(page=page, per_page=10, error_out=False)
    return render_template('admin/products.html', products=pagination.items, pagination=pagination)

@admin_bp.route('/product/new', methods=['GET', 'POST'])
@admin_required
def new_product():
    form = ProductForm()
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    if form.validate_on_submit():
        product = Product(
            name=form.name.data,
            price=form.price.data,
            image=form.image.data,
            brand=form.brand.data,
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
    
    if form.validate_on_submit():
        product.name = form.name.data
        product.price = form.price.data
        product.image = form.image.data
        product.brand = form.brand.data
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

@admin_bp.route('/orders')
@admin_required
def orders():
    page = request.args.get('page', 1, type=int)
    pagination = Order.query.order_by(Order.timestamp.desc()).paginate(page=page, per_page=10, error_out=False)
    return render_template('admin/orders.html', orders=pagination.items, pagination=pagination)
