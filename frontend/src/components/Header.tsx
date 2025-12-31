"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Bell, User } from 'lucide-react';

export const Header = () => {
  const [userData, setUserData] = useState<{ fullName: string; role: string } | null>(null);
  const router = useRouter();

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
        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} onClick={() => router.push('/notifications')}/>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            {/* Hiển thị fullName thật thay vì 'Đang tải' */}
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