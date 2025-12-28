"use client";

import React from 'react';
import { Home, Search, Plus, Users, MapPin, ArrowRightLeft, Split, UserCheck } from 'lucide-react';

const HouseholdsPage = () => {
  const households = [
    { maHoKhau: "HK001", tenChuHo: "Nguyễn Văn An", diaChi: "10 Tạ Quang Bửu, Hai Bà Trưng", soThanhVien: 4 },
    { maHoKhau: "HK002", tenChuHo: "Lê Thị Bình", diaChi: "Chung cư BlueStar, Gia Lâm", soThanhVien: 3 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sổ quản lý hộ khẩu</h2>
          <p className="text-gray-500 mt-1">Quản lý danh sách hộ gia đình và hồ sơ cư trú địa phương</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-semibold">
          <Plus size={20} /> Tách/Lập hộ mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Tìm theo mã hộ khẩu hoặc tên chủ hộ..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {households.map((h) => (
          <div key={h.maHoKhau} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Home size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button title="Đổi chủ hộ" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><UserCheck size={18} /></button>
                <button title="Tách hộ" className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"><Split size={18} /></button>
                <button title="Chuyển hộ" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><ArrowRightLeft size={18} /></button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{h.tenChuHo}</h3>
              <p className="text-sm font-mono text-blue-600 font-semibold mb-3">Mã hộ: {h.maHoKhau}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} /> {h.diaChi}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={14} /> {h.soThanhVien} nhân khẩu trong hộ
                </div>
              </div>
            </div>
            <button className="mt-6 w-full py-3 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-600 rounded-2xl font-bold text-sm transition-all">
              Xem chi tiết hồ sơ hộ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HouseholdsPage;