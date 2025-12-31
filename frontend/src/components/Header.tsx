"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Thêm usePathname
import { Bell, User } from 'lucide-react';

export const Header = () => {
  const [userData, setUserData] = useState<{ fullName: string; role: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Khởi tạo để theo dõi route hiện tại

  useEffect(() => {
    // Lấy thông tin từ localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Lỗi parse dữ liệu user:", error);
      }
    }
  }, []);

  // Hàm xử lý khi nhấn vào chuông thông báo
  const handleNotificationClick = () => {
    // Kiểm tra nếu route hiện tại có chứa "/service"
    if (pathname?.includes('/service')) {
      router.push('/service/notification');
    } else {
      router.push('/notifications');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'TO_TRUONG': return 'Tổ trưởng';
      case 'TO_PHO': return 'Tổ phó';
      case 'CAN_BO': return 'Cán bộ';
      case 'CONG_DAN': return 'Công dân';
      default: return 'Người dùng';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex-1">
        <p className="text-xs text-gray-400 font-medium italic">Hệ thống quản lý cư dân điện tử</p>
      </div>
      <div className="flex items-center gap-4">
        {/* Cập nhật onClick cho chuông thông báo */}
        <button 
          onClick={handleNotificationClick}
          className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">
              {userData?.fullName || 'Khách'}
            </p>
            <p className="text-xs text-gray-500">
              {getRoleLabel(userData?.role)}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
            {userData?.fullName ? getInitials(userData.fullName) : <User size={20} />}
          </div>
        </div>
      </div>
    </header>
  );
};