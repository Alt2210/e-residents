"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Shield, Bell, Database, Save, ChevronRight, X, Loader2, 
  CheckCircle, AlertCircle // Thêm icon để làm thông báo đẹp hơn
} from 'lucide-react';
import axios from 'axios';

// Cấu hình API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const SettingsPage = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU & UI ---
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const router = useRouter();

  // --- STATE QUẢN LÝ THÔNG BÁO (Thay thế react-hot-toast) ---
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // --- STATE FORM ---
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: ''
  });

  // Hàm hiển thị thông báo tự chế
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    // Tự động tắt sau 3 giây
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Lấy thông tin user hiện tại
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          const userId = parsedUser.sub || parsedUser._id || parsedUser.id;
          
          const response = await axios.get(`${API_URL}/users/${userId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          
          setUserData(response.data);
          setProfileForm({
            fullName: response.data.fullName,
            username: response.data.username
          });
        }
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        showNotification('error', "Không thể tải thông tin người dùng");
      }
    };

    fetchUserData();
  }, []);

  // Xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotification('error', "Mật khẩu xác nhận không khớp");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showNotification('error', "Mật khẩu mới phải từ 6 ký tự");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const userId = userData?._id || userData?.id;

      await axios.put(`${API_URL}/users/${userId}/change-password`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showNotification('success', "Đổi mật khẩu thành công!");
      setActiveModal(null);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || "Lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cập nhật thông tin
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const userId = userData?._id || userData?.id;

      await axios.put(`${API_URL}/users/${userId}`, {
        fullName: profileForm.fullName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showNotification('success', "Cập nhật thông tin thành công!");
      setUserData({ ...userData, fullName: profileForm.fullName });
      
      // Cập nhật localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, fullName: profileForm.fullName }));
      
      setActiveModal(null);
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || "Bạn không có quyền cập nhật thông tin này");
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => {
    showNotification('success', "Đang tạo file sao lưu (Demo)...");
    // Giả lập delay
    setTimeout(() => {
        showNotification('success', "Đã tải xuống dữ liệu thành công!");
    }, 2000);
  };

  const sections = [
    { 
      id: 'profile',
      icon: <User />, 
      title: "Thông tin cá nhân", 
      desc: `Cập nhật tên hiển thị: ${userData?.fullName || '...'}`,
      action: () => setActiveModal('profile')
    },
    { 
      id: 'security',
      icon: <Shield />, 
      title: "Bảo mật & Mật khẩu", 
      desc: "Thay đổi mật khẩu đăng nhập",
      action: () => setActiveModal('security')
    },
    { 
      id: 'notification',
      icon: <Bell />, 
      title: "Thông báo hệ thống", 
      desc: "Xem lại các thông báo và cảnh báo từ hệ thống", // Sửa lại mô tả
      action: () => router.push('/notifications') // SỬA DÒNG NÀY: Chuyển hướng
    },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 relative min-h-screen">
      
      {/* --- CUSTOM NOTIFICATION UI --- */}
      {notification && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300 ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <div>
            <h4 className="font-bold text-sm">{notification.type === 'success' ? 'Thành công' : 'Thất bại'}</h4>
            <p className="text-sm">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="ml-2 hover:bg-black/5 rounded-full p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cài đặt hệ thống</h2>
        <p className="text-gray-500 mt-1">Quản lý cấu hình tài khoản của: <span className="font-semibold text-blue-600">{userData?.username}</span></p>
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        {sections.map((s, i) => (
          <div 
            key={i} 
            onClick={s.action}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:border-blue-200 cursor-pointer transition-all group hover:shadow-md"
          >
            <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 rounded-2xl flex items-center justify-center transition-colors">
              {React.cloneElement(s.icon as React.ReactElement<any>, { size: 24 })}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900">{s.title}</h4>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {activeModal === 'profile' ? 'Cập nhật thông tin' : 'Đổi mật khẩu'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Form Profile */}
            {activeModal === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                  <input 
                    disabled 
                    value={profileForm.username} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 border-none text-gray-500 cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input 
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 mt-4 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Lưu thay đổi</>}
                </button>
              </div>
            )}

            {/* Form Password */}
            {activeModal === 'security' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
                  <input 
                    type="password"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <input 
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <button 
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 mt-4 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Shield size={18} /> Cập nhật mật khẩu</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;