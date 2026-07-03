# Badminton Shop MERN

Badminton Shop là ứng dụng thương mại điện tử xây dựng bằng MERN stack, bao gồm frontend React + Vite và backend Node.js + Express + MongoDB.

## Cấu trúc

- `backend/`: server Express và API
- `frontend/`: ứng dụng React với Vite

## Yêu cầu

- Node.js 18+
- MongoDB

## Chạy backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt:
   ```bash
   npm install
   ```
3. Tạo file `.env` dựa vào `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Chạy server:
   ```bash
   npm run dev
   ```

## Chạy frontend

1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt:
   ```bash
   npm install
   ```
3. Chạy Vite:
   ```bash
   npm run dev
   ```

## API chính

- `POST /api/auth/register` - đăng ký
- `POST /api/auth/login` - đăng nhập
- `GET /api/auth/profile` - lấy hồ sơ
- `PUT /api/auth/profile` - cập nhật hồ sơ
- `GET /api/products` - danh sách sản phẩm
- `GET /api/products/:id` - chi tiết sản phẩm
- `POST /api/products/:id/reviews` - thêm review
- `POST /api/orders` - tạo đơn hàng
- `GET /api/orders/myorders` - đơn hàng người dùng
- `GET /api/orders/:id` - chi tiết đơn hàng
- `GET /api/users` - danh sách người dùng (admin)
- `PUT /api/users/:id` - cập nhật vai trò người dùng (admin)

## Ghi chú

- Ảnh sản phẩm được upload qua `POST /api/upload`.
- Backend hiện sử dụng thanh toán giả lập `POST /api/payments/charge`.
- Để truy cập trang admin, tài khoản cần có `role: 'admin'`.

## Triển khai bằng Docker

1. Tại thư mục gốc dự án, khởi động MongoDB, backend và frontend:
   ```bash
   docker compose up --build
   ```
2. Backend sẽ chạy tại `http://localhost:5000`.
3. Frontend sẽ chạy tại `http://localhost:5173`.
4. Nếu cần dừng:
   ```bash
   docker compose down
   ```

> Lưu ý: file `backend/.env.example` chỉ dùng làm mẫu. Trước khi chạy trực tiếp, tạo `backend/.env` nếu cần và thiết lập `JWT_SECRET` riêng.
