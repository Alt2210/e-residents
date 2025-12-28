import React from 'react';
import { Users, Home, FileText, BarChart3, Settings, LogOut } from 'lucide-react';

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
    active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-100'
  }`}>
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Home size={24} /> E-Resident
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <NavItem icon={<BarChart3 size={20} />} label="Tổng quan" active />
        <NavItem icon={<Users size={20} />} label="Quản lý nhân khẩu" />
        <NavItem icon={<Home size={20} />} label="Quản lý hộ khẩu" />
        <NavItem icon={<FileText size={20} />} label="Tạm trú / Tạm vắng" />
        <NavItem icon={<Settings size={20} />} label="Cài đặt hệ thống" />
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 text-red-500 font-medium p-2 w-full hover:bg-red-50 rounded-lg transition">
          <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
};