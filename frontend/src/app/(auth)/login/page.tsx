"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Danh sách ảnh cho slideshow bên trái
  const images = [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974"
  ];

  // Tự động chuyển ảnh sau 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="flex min-h-screen bg-white -font-google-sans">
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
            {/* Lớp phủ màu tối để làm nổi bật text nếu cần */}
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

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
              <input 
                type="text" 
                required 
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Tên của bạn"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input 
                type="password" 
                required 
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
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition duration-200"
            >
              Đăng Nhập
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