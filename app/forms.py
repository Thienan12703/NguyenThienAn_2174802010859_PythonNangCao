from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, TextAreaField, FloatField, IntegerField, SelectField
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
    phone = StringField('Số điện thoại', validators=[DataRequired()])
    address = TextAreaField('Địa chỉ giao hàng', validators=[DataRequired()])
    payment_method = SelectField('Phương thức thanh toán', choices=[('COD', 'Thanh toán khi nhận hàng (COD)')])
    submit = SubmitField('Xác nhận đặt hàng')

class ReviewForm(FlaskForm):
    rating = SelectField('Đánh giá', choices=[(5, '5 Sao'), (4, '4 Sao'), (3, '3 Sao'), (2, '2 Sao'), (1, '1 Sao')], coerce=int)
    comment = TextAreaField('Bình luận', validators=[DataRequired()])
    submit = SubmitField('Gửi đánh giá')

class ProductForm(FlaskForm):
    name = StringField('Tên sản phẩm', validators=[DataRequired()])
    price = FloatField('Giá', validators=[DataRequired()])
    image = StringField('Link ảnh')
    brand = StringField('Thương hiệu', validators=[DataRequired()])
    category_id = SelectField('Danh mục', coerce=int)
    description = TextAreaField('Mô tả')
    stock = IntegerField('Tồn kho', default=0)
    submit = SubmitField('Lưu sản phẩm')
