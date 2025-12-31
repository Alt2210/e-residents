"use client";

import React, { useEffect, useState } from 'react';
import api from '@/src/lib/api'; // Hãy đảm bảo đường dẫn này đúng
import { User, Calendar, IdCard, Briefcase, MapPin } from 'lucide-react';

export default function PersonalInfo() {
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy dữ liệu user từ localStorage (đã được lưu lúc login)
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setError("Vui lòng đăng nhập lại.");
          return;
        }

        const user = JSON.parse(storedUser);
        const myCCCD = user.soCCCD;

        if (!myCCCD) {
          setError("Tài khoản chưa có số CCCD liên kết.");
          return;
        }

        // 2. Tái sử dụng API search của hệ thống bằng CCCD cá nhân
        const res = await api.get('/persons/search', {
          params: { soCCCD: myCCCD }
        });

        if (res.data?.data?.length > 0) {
          setPerson(res.data.data[0]);
        } else {
          setError("Không tìm thấy hồ sơ nhân khẩu tương ứng.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-medium">Đang tải dữ liệu dân cư...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase tracking-tight">Thông tin nhân khẩu cá nhân</h1>
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl">
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <InfoItem icon={<User className="text-blue-500" size={20}/>} label="Họ và tên" value={person?.hoTen} />
            <InfoItem icon={<Calendar className="text-orange-500" size={20}/>} label="Ngày sinh" value={person?.ngaySinh ? new Date(person.ngaySinh).toLocaleDateString('vi-VN') : '---'} />
            <InfoItem icon={<IdCard className="text-emerald-500" size={20}/>} label="Số CCCD" value={person?.soCCCD} />
          </div>
          <div className="space-y-6">
            <InfoItem icon={<Briefcase className="text-purple-500" size={20}/>} label="Nghề nghiệp" value={person?.ngheNghiep || 'Tự do'} />
            <InfoItem icon={<MapPin className="text-red-500" size={20}/>} label="Quan hệ với chủ hộ" value={person?.quanHeVoiChuHo} />
            <div className="pt-4 border-t border-gray-50">
               <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Trạng thái hiện tại</p>
              <span className={`px-4 py-2 rounded-xl text-xs  uppercase tracking-widest ${person?.trangThai === 'THUONG_TRU' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                {person?.trangThai?.replace('_', ' ') || 'KHÔNG XÁC ĐỊNH'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4 group">
    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-white border border-transparent group-hover:border-gray-100">{icon}</div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-tighter">{label}</p>
      <p className="text-gray-900 font-bold text-lg">{value || 'Chưa cập nhật'}</p>
    </div>
  </div>
);