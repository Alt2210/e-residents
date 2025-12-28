# Hướng dẫn Chạy Server và Test API

## 📋 Yêu cầu hệ thống

- Node.js (v18 hoặc cao hơn)
- MongoDB (local hoặc MongoDB Atlas)
- npm hoặc yarn

## 🚀 Các bước chạy server

### 1. Cài đặt Dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình MongoDB

#### Option A: MongoDB Local
- Cài đặt MongoDB trên máy local
- Đảm bảo MongoDB đang chạy trên port 27017

#### Option B: MongoDB Atlas (Cloud)
- Tạo tài khoản tại https://www.mongodb.com/cloud/atlas
- Tạo cluster và lấy connection string

### 3. Tạo file .env

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
MONGODB_URI=mongodb://localhost:27017/quan_ly_dan_cu
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
```

**Lưu ý:** 
- Nếu dùng MongoDB Atlas, thay `MONGODB_URI` bằng connection string từ Atlas
- Thay `JWT_SECRET` bằng một chuỗi bí mật mạnh trong production

### 4. Chạy Server

```bash
# Development mode (tự động reload khi có thay đổi)
npm run start:dev

# Hoặc production mode
npm run start:prod
```

Server sẽ chạy tại: **http://localhost:3000**

## 📚 Test API với Swagger

1. Khởi động server
2. Truy cập: **http://localhost:3000/api**
3. Swagger UI sẽ hiển thị tất cả các API endpoints
4. Bạn có thể test trực tiếp trên Swagger UI

### Cách sử dụng Swagger:

1. **Đăng nhập trước:**
   - POST `/auth/login`
   - Body: `{ "username": "admin", "password": "123456" }`
   - Copy `access_token` từ response

2. **Authorize:**
   - Click nút **Authorize** ở góc trên bên phải
   - Nhập: `Bearer <access_token>`
   - Click **Authorize** và **Close**

3. **Test các API khác:**
   - Tất cả các API đã được bảo vệ bởi JWT sẽ hoạt động
   - Click **Try it out** trên mỗi endpoint để test

## 🔐 Tạo User đầu tiên

Để test được các API, bạn cần tạo user đầu tiên. Có 2 cách:

### Cách 1: Tạo bằng code (Tạm thời)

Bạn có thể tạo một script tạm thời để tạo user:

```bash
# Tạm thời comment guard trong auth.controller.ts để tạo user đầu tiên
# Hoặc dùng MongoDB Compass/MongoDB Shell để insert trực tiếp
```

### Cách 2: Sử dụng MongoDB Shell

```javascript
use quan_ly_dan_cu

db.users.insertOne({
  username: "admin",
  password: "$2b$10$YourHashedPasswordHere", // Cần hash password bằng bcrypt
  fullName: "Admin User",
  role: "TO_TRUONG",
  assignedModules: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Hoặc** tạm thời comment `@UseGuards(JwtAuthGuard)` trong `users.controller.ts` để tạo user đầu tiên, sau đó uncomment lại.

## 🧪 Test với Postman hoặc cURL

### 1. Đăng nhập

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "fullName": "Admin User",
    "role": "TO_TRUONG"
  }
}
```

### 2. Test API với Token

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Các API Endpoints chính

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất
- `POST /auth/change-password` - Đổi mật khẩu

### Users
- `GET /users` - Danh sách users
- `POST /users` - Tạo user mới (Tổ trưởng/Tổ phó)
- `GET /users/:id` - Chi tiết user
- `PUT /users/:id` - Cập nhật user
- `PATCH /users/:id/toggle-active` - Khóa/mở khóa user

### Households (Hộ khẩu)
- `POST /households` - Tạo hộ khẩu mới
- `GET /households/search` - Tìm kiếm hộ khẩu
- `GET /households/:id` - Chi tiết hộ khẩu
- `PUT /households/:id` - Cập nhật hộ khẩu
- `POST /households/:id/change-head` - Đổi chủ hộ
- `POST /households/:id/split` - Tách hộ
- `GET /households/:id/history` - Lịch sử biến động

### Persons (Nhân khẩu)
- `POST /persons/newborn` - Thêm nhân khẩu mới sinh
- `POST /persons` - Thêm nhân khẩu nhập hộ
- `GET /persons/search` - Tìm kiếm nhân khẩu
- `GET /persons/:id` - Chi tiết nhân khẩu
- `PUT /persons/:id` - Cập nhật nhân khẩu
- `PATCH /persons/:id/mark-moved` - Ghi nhận chuyển đi
- `PATCH /persons/:id/mark-deceased` - Ghi nhận qua đời

### Residence (Tạm trú/Tạm vắng)
- `POST /residence/temporary` - Cấp giấy tạm trú
- `POST /residence/absence` - Cấp giấy tạm vắng
- `GET /residence/temporary/search` - Tra cứu tạm trú
- `GET /residence/absence/search` - Tra cứu tạm vắng
- `PATCH /residence/temporary/:id/extend` - Gia hạn tạm trú
- `PATCH /residence/absence/:id/extend` - Gia hạn tạm vắng

### Feedback (Phản ánh/Kiến nghị)
- `POST /feedback` - Ghi nhận phản ánh
- `GET /feedback/search` - Tìm kiếm phản ánh
- `GET /feedback/:id` - Chi tiết phản ánh
- `PATCH /feedback/:id/status` - Cập nhật trạng thái
- `POST /feedback/:id/response` - Phản hồi
- `POST /feedback/:id/merge` - Gộp kiến nghị trùng

### Statistics (Thống kê)
- `GET /statistics/population/gender` - Thống kê theo giới tính
- `GET /statistics/population/age-groups` - Thống kê theo độ tuổi
- `GET /statistics/changes` - Thống kê biến động
- `GET /statistics/temporary` - Thống kê tạm trú/tạm vắng
- `GET /statistics/feedback/status` - Thống kê kiến nghị

## ⚠️ Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra MongoDB đã chạy chưa: `mongod --version`
- Kiểm tra connection string trong file `.env`
- Đảm bảo MongoDB không bị chặn bởi firewall

### Lỗi JWT
- Kiểm tra `JWT_SECRET` đã được set trong `.env`
- Đảm bảo token được gửi đúng format: `Bearer <token>`

### Lỗi CORS
- Cấu hình CORS đã được set trong `main.ts`
- Nếu frontend ở port khác, cần cập nhật `origin` trong CORS config

### Lỗi Validation
- Kiểm tra body request có đúng format không
- Xem các DTO validation trong từng module

## 📖 Tham khảo thêm

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Swagger/OpenAPI](https://swagger.io/docs/)

