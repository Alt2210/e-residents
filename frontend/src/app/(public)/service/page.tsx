"use client";

import React, { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, MessageSquare, ShieldCheck } from 'lucide-react';
import api from '@/src/lib/api'; // Đường dẫn tới axios instance của bạn

export default function ServiceOverview() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage đã lưu lúc login
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Xin chào, {userData?.fullName || 'Công dân'}!
        </h1>
        <p className="text-gray-500">Chào mừng bạn đến với Cổng dịch vụ cư dân trực tuyến.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-gray-700">Trạng thái cư trú</h3>
          <p className="text-sm text-gray-500 mt-1">Đang thường trú</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold text-gray-700">Kiến nghị của bạn</h3>
          <p className="text-sm text-gray-500 mt-1">0 kiến nghị đang chờ xử lý</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
            <FileText size={24} />
          </div>
          <h3 className="font-bold text-gray-700">Giấy tờ lưu trữ</h3>
          <p className="text-sm text-gray-500 mt-1">Xem các bản khai điện tử</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Thông báo từ Tổ dân phố</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
            <p className="text-sm font-semibold">Thông báo về việc thu phí an ninh trật tự</p>
            <p className="text-xs text-gray-500">Ngày đăng: 25/12/2023</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm font-semibold">Lịch tiêm chủng mở rộng tại Trạm y tế</p>
            <p className="text-xs text-gray-500">Ngày đăng: 20/12/2023</p>
          </div>
        </div>
      </div>
    </div>
  );
}