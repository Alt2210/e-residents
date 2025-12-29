"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/src/lib/api'; // Đường dẫn tới file axios instance của bạn

export default function LoginPage() {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);

  // State để quản lý dữ liệu nhập vào
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const images = [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  // HÀM XỬ LÝ ĐĂNG NHẬP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Gọi API đăng nhập thông qua Axios instance đã cấu hình
      const response = await api.post('/auth/login', {
        username,
        password
      });

      // Lấy Token và thông tin từ Backend trả về
      const { access_token } = response.data;

      if (access_token) {
        // Lưu token vào localStorage để các request sau tự động sử dụng
        localStorage.setItem('access_token', access_token);
        
        // Sau khi kiểm tra tài khoản thành công, điều hướng vào Dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      // Hiển thị lỗi từ server hoặc lỗi kết nối
      const message = err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* PHẦN BÊN TRÁI: SLIDESHOW */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url('${img}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-12 text-white">
              <h1 className="text-4xl font-bold mb-4">Hệ Thống Quản Lý E-Resident</h1>
              <p className="text-lg opacity-80">Giải pháp quản lý nhân khẩu, hộ khẩu thông minh và hiệu quả.</p>
            </div>
          </div>
        ))}
      </div>

      {/* PHẦN BÊN PHẢI: FORM ĐĂNG NHẬP */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
            <p className="mt-2 text-gray-600">Chào mừng bạn quay trở lại!</p>
          </div>

          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm border border-red-200 text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Tên của bạn"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-gray-900">Ghi nhớ đăng nhập</label>
              </div>
              <Link href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</Link>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-semibold shadow-md transition duration-200`}
            >
              {isLoading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Bạn chưa có tài khoản?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-bold">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}