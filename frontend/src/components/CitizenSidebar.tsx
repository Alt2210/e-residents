"use client";

import React from 'react';
import { 
  Users, 
  Home, 
  Settings, 
  LogOut, 
  MessageSquare, 
  LayoutDashboard,
  Form,
  UserCircle
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
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
        ? 'bg-green-600 text-white shadow-md shadow-green-100' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}>
      <span className={active ? 'text-white' : 'text-gray-400'}>{icon}</span>
      <span className={`${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  </Link>
);

export const CitizenSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <aside className="w-68 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-green-600 flex items-center gap-2">
          <Home size={24} /> E-Resident
        </h1>
        <p className="text-xs text-gray-400 mt-1 ml-8">Cổng thông tin công dân</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Thông tin chung" 
          href="/service" 
          active={isActive('/service')} 
        />
        <NavItem 
          icon={<UserCircle size={20} />} 
          label="Thông tin nhân khẩu" 
          href="/service/personal" 
          active={isActive('/service/personal')} 
        />
        <NavItem 
          icon={<Home size={20} />} 
          label="Thông tin hộ khẩu" 
          href="/service/household" 
          active={isActive('/service/household')} 
        />
        <NavItem 
          icon={<MessageSquare size={20} />} 
          label="Phản ánh, kiến nghị" 
          href="/service/feedback" 
          active={isActive('/service/feedback')} 
        />
        <NavItem 
          icon={<Form size={20} />} 
          label="Tạm trú/Tạm vắng" 
          href="/service/residence" 
          active={isActive('/service/residence')} 
        />
        <NavItem 
          icon={<Settings size={20} />} 
          label="Cài đặt tài khoản" 
          href="/service/settings" 
          active={isActive('/service/settings')} 
        />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 font-medium p-2 w-full hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default CitizenSidebar;