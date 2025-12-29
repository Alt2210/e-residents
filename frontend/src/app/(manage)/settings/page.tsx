"use client";

import React from 'react';
import { User, Shield, Bell, Database, Save, ChevronRight } from 'lucide-react';

const SettingsPage = () => {
  const sections = [
    { icon: <User />, title: "Thông tin cá nhân", desc: "Cập nhật ảnh đại diện và thông tin liên hệ của cán bộ" },
    { icon: <Shield />, title: "Bảo mật & Mật khẩu", desc: "Thay đổi mật khẩu và cấu hình xác thực 2 lớp" },
    { icon: <Bell />, title: "Thông báo hệ thống", desc: "Tùy chọn nhận thông báo khi có yêu cầu khai báo mới" },
    { icon: <Database />, title: "Sao lưu dữ liệu", desc: "Xuất file Excel hoặc sao lưu cơ sở dữ liệu nhân khẩu" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cài đặt hệ thống</h2>
        <p className="text-gray-500 mt-1">Quản lý cấu hình tài khoản và các thông số vận hành</p>
      </div>

      <div className="space-y-4">
        {sections.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:border-blue-200 cursor-pointer transition-all group">
            <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 rounded-2xl flex items-center justify-center transition-colors">
              {React.cloneElement(s.icon as React.ReactElement<any>, {
                size: 24
              })}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900">{s.title}</h4>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-bold">
          <Save size={20} /> Lưu tất cả thay đổi
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;