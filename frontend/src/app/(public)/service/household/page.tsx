"use client";

import React, { useEffect, useState } from 'react';
import api from '@/src/lib/api'; // Đảm bảo đường dẫn này đúng với project của bạn
import { Home, Users, MapPin } from 'lucide-react';

export default function HouseholdInfo() {
  const [household, setHousehold] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouseholdData = async () => {
      try {
        // 1. Lấy thông tin user từ localStorage (đã được lưu lúc login)
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setError("Vui lòng đăng nhập lại.");
          return;
        }

        const user = JSON.parse(storedUser);
        const myCCCD = user.soCCCD;

        if (!myCCCD) {
          setError("Tài khoản chưa liên kết số CCCD.");
          return;
        }

        // 2. Gọi API search nhân khẩu theo CCCD. 
        // Backend trả về person kèm householdId đã được populate
        const res = await api.get('/persons/search', {
          params: { soCCCD: myCCCD }
        });

        if (res.data?.data?.length > 0) {
          // Lấy thông tin hộ khẩu từ object nhân khẩu đầu tiên tìm thấy
          setHousehold(res.data.data[0].householdId);
        } else {
          setError("Không tìm thấy thông tin hộ khẩu của bạn.");
        }
      } catch (err: any) {
        console.error("Lỗi:", err);
        setError("Không thể tải dữ liệu hộ khẩu.");
      } finally {
        setLoading(false);
      }
    };

    fetchHouseholdData();
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu hộ gia đình...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-medium">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thông tin hộ khẩu gia đình</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<Home size={24} />} 
          label="Số hộ khẩu" 
          value={household?.soHoKhau} 
          color="text-blue-500" 
          bgColor="bg-blue-50"
        />
        <StatCard 
          icon={<MapPin size={24} />} 
          label="Địa chỉ" 
          value={household ? `${household.soNha} ${household.duongPho}` : '---'} 
          color="text-green-500" 
          bgColor="bg-green-50"
        />
        <StatCard 
          icon={<Users size={24} />} 
          label="Khu vực" 
          value={household ? `${household.phuong}, ${household.quan}` : '---'} 
          color="text-purple-500" 
          bgColor="bg-purple-50"
        />
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-4 text-amber-600">
          <Users size={20} />
          <h2 className="font-bold text-lg">Lưu ý quan trọng</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Thông tin hộ khẩu này được trích xuất trực tiếp từ hệ thống quản lý cư dân điện tử. 
          Nếu thông tin địa chỉ hoặc số sổ không chính xác, vui lòng mang căn cước công dân đến gặp 
          <strong> Tổ trưởng</strong> hoặc <strong>Cán bộ quản lý</strong> để thực hiện đính chính.
        </p>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color, bgColor }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-105">
    <div className={`w-12 h-12 ${bgColor} ${color} rounded-xl flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{label}</p>
    <p className="text-lg font-black text-gray-800 mt-1">{value || 'Chưa có dữ liệu'}</p>
  </div>
);