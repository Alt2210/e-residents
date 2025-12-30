"use client";

import React, { useState } from 'react';
import api from '@/src/lib/api';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword }); // API đã có sẵn
      alert('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="font-bold mb-4">Đổi mật khẩu</h2>
        <form onSubmit={handleChangePass} className="space-y-4">
          <input 
            type="password" 
            placeholder="Mật khẩu cũ" 
            className="w-full p-3 rounded-xl border border-gray-200"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Mật khẩu mới (ít nhất 6 ký tự)" 
            className="w-full p-3 rounded-xl border border-gray-200"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-black transition">
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}