# 🚀 HƯỚNG DẪN CHẠY SERVER VÀ TEST API

## 📋 Yêu cầu

1. **Node.js** (phiên bản 18 trở lên)
2. **MongoDB** (local hoặc MongoDB Atlas - miễn phí)
3. **npm** hoặc **yarn**

## 🔧 Các bước thực hiện

### Bước 1: Cài đặt Dependencies

Mở terminal/command prompt và chạy:

```bash
cd backend
npm install
```

### Bước 2: Cấu hình MongoDB

#### Cách 1: MongoDB Local (Cài đặt trên máy)

1. Tải MongoDB Community Edition từ: https://www.mongodb.com/try/download/community
2. Cài đặt và khởi động MongoDB service
3. MongoDB sẽ chạy tại: `mongodb://localhost:27017`

#### Cách 2: MongoDB Atlas (Cloud - Miễn phí)

1. Đăng ký tài khoản tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string (dạng: `mongodb+srv://username:password@cluster.mongodb.net/...`)

### Bước 3: Tạo file .env

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
MONGODB_URI=mongodb://localhost:27017/quan_ly_dan_cu
JWT_SECRET=my-super-secret-jwt-key-change-in-production-12345
PORT=3000
```

**Nếu dùng MongoDB Atlas**, thay `MONGODB_URI` bằng connection string từ Atlas.

### Bước 4: Tạo User Admin đầu tiên

Chạy script để tạo user admin:

```bash
node scripts/create-admin.js
```

User mặc định được tạo:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **LƯU Ý QUAN TRỌNG:** Hãy đổi mật khẩu ngay sau khi đăng nhập lần đầu!

### Bước 5: Khởi động Server

```bash
npm run start:dev
```

Nếu thành công, bạn sẽ thấy:
```
Application is running on: http://[::1]:3000
Swagger Docs available at: http://[::1]:3000/api
```

## 🧪 TEST API

### Cách 1: Sử dụng Swagger UI (Khuyên dùng)

1. Mở trình duyệt và truy cập: **http://localhost:3000/api**

2. **Đăng nhập để lấy token:**
   - Tìm endpoint `POST /auth/login`
   - Click **Try it out**
   - Nhập body:
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
   - Click **Execute**
   - Copy `access_token` từ response

3. **Authorize (Quan trọng!):**
   - Click nút **🔒 Authorize** ở góc trên bên phải của Swagger UI
   - Trong ô "Value", nhập: `<access_token>` 
     (Ví dụ: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - Click **Authorize**
   - Click **Close**

4. **Test các API khác:**
   - Bây giờ bạn có thể test tất cả các API endpoints
   - Click **Try it out** trên mỗi endpoint
   - Điền thông tin và click **Execute**

### Cách 2: Sử dụng Postman

1. **Đăng nhập:**
   - Method: `POST`
   - URL: `http://localhost:3000/auth/login`
   - Body (raw JSON):
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
   - Copy `access_token` từ response

2. **Test API khác:**
   - Vào tab **Authorization**
   - Chọn Type: **Bearer Token**
   - Nhập token vào ô **Token**
   - Gửi request

### Cách 3: Sử dụng cURL (Command Line)

**Đăng nhập:**
```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Test API với token:**
```bash
curl -X GET http://localhost:3000/users ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

*(Lưu ý: Trên Windows dùng `^` thay vì `\`)*

## 📝 Các API Endpoints chính

### 🔐 Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất  
- `POST /auth/change-password` - Đổi mật khẩu

### 👥 Users (Người dùng)
- `GET /users` - Danh sách users
- `POST /users` - Tạo user mới
- `GET /users/:id` - Chi tiết user
- `PUT /users/:id` - Cập nhật user
- `PATCH /users/:id/toggle-active` - Khóa/mở khóa user

### 🏠 Households (Hộ khẩu)
- `POST /households` - Tạo hộ khẩu mới
- `GET /households/search` - Tìm kiếm hộ khẩu
- `GET /households/:id` - Chi tiết hộ khẩu
- `PUT /households/:id` - Cập nhật hộ khẩu
- `POST /households/:id/change-head` - Đổi chủ hộ
- `POST /households/:id/split` - Tách hộ
- `GET /households/:id/history` - Lịch sử biến động

### 👤 Persons (Nhân khẩu)
- `POST /persons/newborn` - Thêm nhân khẩu mới sinh
- `POST /persons` - Thêm nhân khẩu nhập hộ
- `GET /persons/search` - Tìm kiếm nhân khẩu
- `GET /persons/:id` - Chi tiết nhân khẩu
- `PUT /persons/:id` - Cập nhật nhân khẩu
- `PATCH /persons/:id/mark-moved` - Ghi nhận chuyển đi
- `PATCH /persons/:id/mark-deceased` - Ghi nhận qua đời

### 🏛️ Residence (Tạm trú/Tạm vắng)
- `POST /residence/temporary` - Cấp giấy tạm trú
- `POST /residence/absence` - Cấp giấy tạm vắng
- `GET /residence/temporary/search` - Tra cứu tạm trú
- `GET /residence/absence/search` - Tra cứu tạm vắng
- `PATCH /residence/temporary/:id/extend` - Gia hạn tạm trú
- `PATCH /residence/absence/:id/extend` - Gia hạn tạm vắng

### 💬 Feedback (Phản ánh/Kiến nghị)
- `POST /feedback` - Ghi nhận phản ánh
- `GET /feedback/search` - Tìm kiếm phản ánh
- `GET /feedback/:id` - Chi tiết phản ánh
- `PATCH /feedback/:id/status` - Cập nhật trạng thái
- `POST /feedback/:id/response` - Phản hồi
- `POST /feedback/:id/merge` - Gộp kiến nghị trùng

### 📊 Statistics (Thống kê)
- `GET /statistics/population/gender` - Thống kê theo giới tính
- `GET /statistics/population/age-groups` - Thống kê theo độ tuổi
- `GET /statistics/changes` - Thống kê biến động
- `GET /statistics/temporary` - Thống kê tạm trú/tạm vắng
- `GET /statistics/feedback/status` - Thống kê kiến nghị

## ⚠️ Xử lý lỗi thường gặp

### ❌ Lỗi: "Cannot find module 'bcrypt'"
```bash
npm install bcrypt @types/bcrypt
```

### ❌ Lỗi: "MongoNetworkError" hoặc "MongooseServerSelectionError"
- ✅ Kiểm tra MongoDB đã chạy chưa
- ✅ Kiểm tra connection string trong file `.env`
- ✅ Nếu dùng MongoDB Atlas, kiểm tra:
  - IP whitelist (thêm IP hiện tại hoặc 0.0.0.0/0 để cho phép tất cả)
  - Username và password đúng chưa

### ❌ Lỗi: "EADDRINUSE: address already in use"
- Port 3000 đã được sử dụng
- Giải pháp:
  - Thay đổi PORT trong file `.env`
  - Hoặc dừng process đang dùng port 3000:
    ```bash
    # Windows
    netstat -ano | findstr :3000
    taskkill /PID <PID> /F
    ```

### ❌ Lỗi: "Unauthorized" khi test API
- Token đã hết hạn (token hết hạn sau 1 ngày)
- Giải pháp: Đăng nhập lại để lấy token mới

### ❌ Lỗi: "Forbidden" hoặc "Insufficient permissions"
- User không có quyền truy cập endpoint đó
- Kiểm tra role của user (TO_TRUONG có quyền cao nhất)

## 📚 Tài liệu tham khảo

- **Swagger API Docs:** http://localhost:3000/api
- **NestJS Documentation:** https://docs.nestjs.com/
- **MongoDB Documentation:** https://docs.mongodb.com/

## 🎯 Ví dụ Test API đầy đủ

1. **Đăng nhập** → Lấy token
2. **Tạo hộ khẩu mới:**
   ```json
   POST /households
   {
     "soHoKhau": "HK001",
     "soNha": "123",
     "duongPho": "Đường Láng",
     "phuong": "Trung Hòa",
     "quan": "Cầu Giấy"
   }
   ```

3. **Tạo nhân khẩu mới sinh:**
   ```json
   POST /persons/newborn
   {
     "householdId": "ID_HO_KHAU_VUA_TAO",
     "hoTen": "Nguyễn Văn A",
     "ngaySinh": "2024-01-15",
     "gioiTinh": "Nam",
     "quanHeVoiChuHo": "Con",
     "ngayDangKyThuongTru": "2024-01-20"
   }
   ```

4. **Tìm kiếm nhân khẩu:**
   ```
   GET /persons/search?hoTen=Nguyễn
   ```

Chúc bạn code vui vẻ! 🎉

