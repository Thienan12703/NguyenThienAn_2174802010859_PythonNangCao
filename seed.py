from app import create_app, db
from app.models import User, Category, Product, Post

app = create_app()

with app.app_context():
    # 1. Khởi tạo lại toàn bộ bảng CSDL
    db.drop_all()
    db.create_all()
    print("Đã tạo bảng cơ sở dữ liệu mới.")

    # 2. Tạo Admin User
    admin = User(username='Admin', email='admin@gmail.com', role='admin')
    admin.set_password('123456')
    db.session.add(admin)
    
    # 3. Tạo User bình thường
    user = User(username='Khách hàng', email='user@gmail.com', role='user')
    user.set_password('123456')
    db.session.add(user)

    # 4. Tạo Danh mục (ĐÚNG NHƯ BẢN GỐC)
    c1 = Category(name='Vợt Cầu Lông', slug='vot-cau-long')
    c2 = Category(name='Giày Cầu Lông', slug='giay-cau-long')
    c3 = Category(name='Quần áo', slug='quan-ao')
    c4 = Category(name='Túi / Balo', slug='tui-balo')
    c5 = Category(name='Phụ kiện', slug='phu-kien')
    
    db.session.add_all([c1, c2, c3, c4, c5])
    db.session.commit()

    # 5. Tạo Sản phẩm mẫu
    p1 = Product(
        name='Vợt Cầu Lông Yonex Astrox 99 Pro Chính Hãng', 
        price=3500000, brand='Yonex', stock=10, category_id=c1.id, 
        image='https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-astrox-99-pro-trang-chinh-hang-1.webp',
        description='Vợt cầu lông Yonex Astrox 99 Pro là siêu phẩm tấn công mạnh mẽ dành cho các VĐV chuyên nghiệp. Công nghệ đũa vợt Namd giúp tăng sức đập.'
    )
    p2 = Product(
        name='Giày Cầu Lông Yonex 65Z3 Trắng Đen', 
        price=2800000, brand='Yonex', stock=5, category_id=c2.id,
        image='https://shopvnb.com/uploads/gallery/giay-cau-long-yonex-65z3-trang-den-chinh-hang.webp',
        description='Giày cầu lông êm ái, bám sân cực tốt. Công nghệ Power Cushion+ mang lại độ bật nảy hoàn hảo.'
    )
    p3 = Product(
        name='Áo Cầu Lông Yonex YN01 Đỏ', 
        price=350000, brand='Yonex', stock=50, category_id=c3.id,
        image='https://shopvnb.com/uploads/gallery/ao-cau-long-yonex-xam-03-chinh-hang.webp',
        description='Áo cầu lông Yonex vải mè thấm hút mồ hôi cực kỳ thoáng mát.'
    )
    p4 = Product(
        name='Balo Cầu Lông Lining ABKS293', 
        price=1200000, brand='Lining', stock=8, category_id=c4.id,
        image='https://shopvnb.com/uploads/gallery/balo-cau-long-lining-abks293-1-chinh-hang.webp',
        description='Balo cầu lông Lining cao cấp, form cứng cáp, chứa được nhiều vợt và giày.'
    )
    p5 = Product(
        name='Quấn cán Yonex AC102EX', 
        price=35000, brand='Yonex', stock=100, category_id=c5.id,
        image='https://shopvnb.com/uploads/gallery/quan-can-vot-cau-long-yonex-ac102ex-3-in-1-den-chinh-hang.webp',
        description='Quấn cán Yonex AC102EX chính hãng, độ bám dính siêu tốt, êm tay.'
    )
    
    db.session.add_all([p1, p2, p3, p4, p5])

    # 6. Tạo Bài viết Blog
    post = Post(title='Khai trương siêu thị cầu lông lớn nhất TPHCM', slug='khai-truong',
                content='<p>Nhân dịp khai trương chi nhánh mới, hệ thống cửa hàng chúng tôi tổ chức chương trình khuyến mãi lớn nhất trong năm. Toàn bộ các sản phẩm giảm giá lên đến 50%. Đặc biệt khi mua vợt Yonex sẽ được tặng kèm quấn cán và lưới.</p>',
                thumbnail='https://images.unsplash.com/photo-1622279457486-640c4cb71653?w=800&q=80',
                user_id=admin.id)
    db.session.add(post)

    db.session.commit()
    print("Đã seed dữ liệu mẫu (đầy đủ các danh mục gốc) thành công!")
