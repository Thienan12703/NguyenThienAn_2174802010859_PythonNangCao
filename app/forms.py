from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed
from wtforms import StringField, PasswordField, SubmitField, BooleanField, TextAreaField, FloatField, IntegerField, SelectField, MultipleFileField
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError, Length
from app.models import User

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Mật khẩu', validators=[DataRequired()])
    remember_me = BooleanField('Nhớ mật khẩu')
    submit = SubmitField('Đăng nhập')

class RegistrationForm(FlaskForm):
    username = StringField('Tên hiển thị', validators=[DataRequired(), Length(min=2, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Mật khẩu', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Xác nhận mật khẩu', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Đăng ký')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Email này đã được sử dụng.')

class CheckoutForm(FlaskForm):
    fullname = StringField('Họ và tên', validators=[DataRequired()])
    email = StringField('Email nhận thông báo', validators=[DataRequired()])
    phone = StringField('Số điện thoại', validators=[DataRequired()])
    address = TextAreaField('Địa chỉ giao hàng', validators=[DataRequired()])
    notes = TextAreaField('Ghi chú đơn hàng (Không bắt buộc)')
    payment_method = SelectField('Phương thức thanh toán', choices=[
        ('COD', 'Thanh toán khi nhận hàng (COD)'),
        ('BANK', 'Chuyển khoản ngân hàng'),
        ('MOMO', 'Ví điện tử MoMo')
    ])
    submit = SubmitField('Xác nhận đặt hàng')

class ReviewForm(FlaskForm):
    rating = SelectField('Đánh giá', choices=[(5, '5 Sao'), (4, '4 Sao'), (3, '3 Sao'), (2, '2 Sao'), (1, '1 Sao')], coerce=int)
    comment = TextAreaField('Bình luận', validators=[DataRequired()])
    submit = SubmitField('Gửi đánh giá')

class ProductForm(FlaskForm):
    name = StringField('Tên sản phẩm', validators=[DataRequired()])
    price = FloatField('Giá', validators=[DataRequired()])
    images = MultipleFileField('Hình ảnh tải lên (có thể chọn nhiều ảnh)', render_kw={'multiple': True})
    brand_id = SelectField('Thương hiệu', coerce=int)
    category_id = SelectField('Danh mục', coerce=int)
    description = TextAreaField('Mô tả')
    stock = IntegerField('Tồn kho', default=0)
    submit = SubmitField('Lưu sản phẩm')

class BrandForm(FlaskForm):
    name = StringField('Tên thương hiệu', validators=[DataRequired()])
    submit = SubmitField('Lưu thương hiệu')

class CategoryForm(FlaskForm):
    name = StringField('Tên danh mục', validators=[DataRequired()])
    submit = SubmitField('Lưu danh mục')

class OrderStatusForm(FlaskForm):
    status = SelectField('Trạng thái giao hàng', choices=[
        ('Chờ duyệt', 'Chờ duyệt'), 
        ('Đang chuẩn bị hàng', 'Đang chuẩn bị hàng'), 
        ('Đã bàn giao đơn vị vận chuyển', 'Đã bàn giao đơn vị vận chuyển'), 
        ('Giao hàng thành công', 'Giao hàng thành công')
    ])
    payment_status = SelectField('Tình trạng thanh toán', choices=[
        ('Chưa thanh toán', 'Chưa thanh toán'), 
        ('Đã thanh toán', 'Đã thanh toán')
    ])
    submit = SubmitField('Cập nhật')

class BannerForm(FlaskForm):
    title = StringField('Tiêu đề')
    image = MultipleFileField('Hình ảnh Banner (có thể chọn nhiều ảnh)')
    link = StringField('Link chuyển hướng (vd: /products)')
    is_active = BooleanField('Đang hoạt động', default=True)
    submit = SubmitField('Lưu Banner')

class PostForm(FlaskForm):
    title = StringField('Tiêu đề', validators=[DataRequired()])
    thumbnail = MultipleFileField('Hình ảnh bài viết (có thể chọn nhiều ảnh)')
    content = TextAreaField('Nội dung (hỗ trợ HTML)', validators=[DataRequired()])
    submit = SubmitField('Lưu bài viết')
