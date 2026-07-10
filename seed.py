from app import create_app, db
from app.models import User, Category, Product, Post

app = create_app()

with app.app_context():
    # 1. Tạo các bảng CSDL
    db.create_all()
    print("Đã tạo bảng cơ sở dữ liệu.")

    # 2. Tạo Admin User
    if not User.query.filter_by(email='admin@gmail.com').first():
        admin = User(username='Admin', email='admin@gmail.com', role='admin')
        admin.set_password('123456')
        db.session.add(admin)
        print("Đã tạo tài khoản admin (admin@gmail.com / 123456)")

    # 3. Tạo User bình thường
    if not User.query.filter_by(email='user@gmail.com').first():
        user = User(username='Khách hàng', email='user@gmail.com', role='user')
        user.set_password('123456')
        db.session.add(user)

    # 4. Tạo Danh mục
    if not Category.query.first():
        c1 = Category(name='Vợt Cầu Lông', slug='vot-cau-long')
        c2 = Category(name='Giày Cầu Lông', slug='giay-cau-long')
        c3 = Category(name='Phụ kiện', slug='phu-kien')
        db.session.add_all([c1, c2, c3])
        db.session.commit() # Để có category_id

        # 5. Tạo Sản phẩm mẫu
        p1 = Product(name='Vợt Yonex Astrox 99 Pro', price=3500000, brand='Yonex', stock=10, category_id=c1.id, 
                     image='https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-astrox-99-pro-trang-chinh-hang-1.webp',
                     description='Vợt cầu lông Yonex Astrox 99 Pro là siêu phẩm tấn công mạnh mẽ dành cho các VĐV chuyên nghiệp.')
        p2 = Product(name='Giày Yonex 65Z3', price=2800000, brand='Yonex', stock=5, category_id=c2.id,
                     image='https://shopvnb.com/uploads/gallery/giay-cau-long-yonex-65z3-trang-den-chinh-hang.webp',
                     description='Giày cầu lông êm ái, bám sân cực tốt. Phù hợp cho mọi loại sân.')
        
        db.session.add_all([p1, p2])

        # 6. Tạo Bài viết
        post = Post(title='Khai trương cửa hàng SmashPro', slug='khai-truong',
                    content='<p>Nhân dịp khai trương, giảm giá 10% cho tất cả đơn hàng đầu tiên.</p>',
                    thumbnail='https://via.placeholder.com/600x400',
                    user_id=admin.id if admin.id else 1)
        db.session.add(post)

    db.session.commit()
    print("Đã seed dữ liệu mẫu thành công!")
