"use client";

import React from 'react';
import { 
  Users, 
  Home, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  MessageSquare, // Icon cho Phản ánh
  Bot            // Icon cho Chatbot
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NavItem = ({ 
  icon, 
  label, 
  href, 
  active = false 
}: { 
  icon: any, 
  label: string, 
  href: string,
  active?: boolean 
}) => (
  <Link href={href} className="block w-full">
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}>
      <span className={active ? 'text-white' : 'text-gray-400'}>{icon}</span>
      <span className={`${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  </Link>
);

export const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Home size={24} /> E-Resident
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <NavItem 
          icon={<BarChart3 size={20} />} 
          label="Tổng quan" 
          href="/dashboard" 
          active={isActive('/dashboard')} 
        />
        <NavItem 
          icon={<Users size={20} />} 
          label="Quản lý nhân khẩu" 
          href="/citizens" 
          active={isActive('/citizens')} 
        />
        <NavItem 
          icon={<Home size={20} />} 
          label="Quản lý hộ khẩu" 
          href="/households" 
          active={isActive('/households')} 
        />
        <NavItem 
          icon={<FileText size={20} />} 
          label="Tạm trú / Tạm vắng" 
          href="/residence" 
          active={isActive('/residence')} 
        />
        
        {/* Phần thêm mới 1: Phản ánh, kiến nghị */}
        <NavItem 
          icon={<MessageSquare size={20} />} 
          label="Phản ánh, kiến nghị" 
          href="/feedback" 
          active={isActive('/feedback')} 
        />

        {/* Phần thêm mới 2: Chatbot hỗ trợ */}
        <NavItem 
          icon={<Bot size={20} />} 
          label="Trợ lý ảo (Chatbot)" 
          href="/chatbot" 
          active={isActive('/chatbot')} 
        />

        <NavItem 
          icon={<Settings size={20} />} 
          label="Cài đặt hệ thống" 
          href="/settings" 
          active={isActive('/settings')} 
        />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 text-red-500 font-medium p-2 w-full hover:bg-red-50 rounded-lg transition">
          <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;