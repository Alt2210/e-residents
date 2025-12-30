import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 ">
      {/* 1. Header / Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white shadow-sm sticky top-0 z-50">
        <div className="text-2xl font-bold text-blue-600">
          e-Residents
        </div>
        <div className="space-x-4">
          <Link href="/login" className="px-5 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
            Đăng nhập
          </Link>
          <Link href="/register" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md">
            Đăng ký ngay
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="px-8 py-20 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center">
        <h1 className="text-5xl font-extrabold mb-6">
          Quản lý dân cư thông minh thời đại số
        </h1>
        <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
          Giải pháp toàn diện giúp quản lý hộ khẩu, tạm trú và nhân khẩu một cách minh bạch, an toàn và hiệu quả.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full hover:shadow-lg transition transform hover:-translate-y-1">
            Tìm hiểu thêm
          </button>
        </div>
      </header>

      {/* 3. Features Section */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Tính năng nổi bật</h2>
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">Quản lý Hộ khẩu</h3>
            <p className="text-gray-600">Tách nhập hộ khẩu, thay đổi chủ hộ dễ dàng chỉ với vài thao tác.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Đăng ký Tạm trú</h3>
            <p className="text-gray-600">Khai báo tạm trú, tạm vắng trực tuyến nhanh chóng và thuận tiện.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Thống kê Thông minh</h3>
            <p className="text-gray-600">Báo cáo số liệu dân cư chính xác theo thời gian thực.</p>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="py-10 bg-gray-800 text-gray-400 text-center text-sm">
        <p>© 2024 e-Residents. Hệ thống quản lý dân cư điện tử.</p>
      </footer>
    </div>
  );
}