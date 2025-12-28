"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070",
    "https://images.unsplash.com/photo-1454165205744-3b78555e5572?q=80&w=2070",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="flex min-h-screen">
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
            <div className="absolute inset-0 bg-blue-900/40 flex flex-col justify-end p-16 text-white">
              <h1 className="text-4xl font-bold mb-4">Gia nhập cộng đồng E-Resident</h1>
              <p className="text-lg opacity-90">Hệ thống quản lý dân cư hiện đại, minh bạch và bảo mật.</p>
            </div>
          </div>
        ))}
      </div>

      {/* PHẦN BÊN PHẢI: FORM ĐĂNG KÝ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Đăng ký tài khoản</h2>
            <p className="text-gray-500 mt-2">Vui lòng điền đầy đủ thông tin bên dưới</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Họ và tên</label>
              <input 
                type="text" 
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Nguyễn Văn A"
              />
            </div>

            {/* TRƯỜNG CCCD MỚI THÊM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Số CCCD / Mã định danh</label>
              <input 
                type="text" 
                maxLength={12}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="0310XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Tên đăng nhập</label>
              <input 
                type="text" 
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="username123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                <input 
                  type="password" 
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Xác nhận</label>
                <input 
                  type="password" 
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start mt-2">
              <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300" required />
              <label className="ml-2 text-xs text-gray-500">
                Tôi đồng ý với <span className="text-blue-600 cursor-pointer">Điều khoản dịch vụ</span> và <span className="text-blue-600 cursor-pointer">Chính sách bảo mật</span>.
              </label>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition duration-300 transform hover:-translate-y-0.5"
            >
              Tạo tài khoản
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-bold">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}