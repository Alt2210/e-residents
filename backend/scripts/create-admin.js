/**
 * Script tạo user admin đầu tiên
 * Chạy: node scripts/create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Cấu hình MongoDB - Thay đổi nếu cần
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quan_ly_dan_cu';

// Thông tin admin mặc định
const adminData = {
  username: 'admin',
  password: 'admin123', // Mật khẩu mặc định - nên đổi sau khi đăng nhập
  fullName: 'Administrator',
  role: 'TO_TRUONG',
  assignedModules: ['HK', 'NK', 'TAM_TRU_TAM_VANG', 'PHAN_ANH', 'THONG_KE'],
  isActive: true,
};

async function createAdmin() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Lấy collection Users
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await usersCollection.findOne({ username: adminData.username });
    if (existingUser) {
      console.log('⚠️  User admin đã tồn tại!');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Tạo user mới
    const newUser = {
      ...adminData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(newUser);
    console.log('✅ Đã tạo user admin thành công!');
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('   ⚠️  LƯU Ý: Vui lòng đổi mật khẩu sau khi đăng nhập!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

createAdmin();

