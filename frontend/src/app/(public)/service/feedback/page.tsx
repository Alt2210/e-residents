"use client";

import React, { useState } from 'react';
import api from '@/src/lib/api';

export default function FeedbackPage() {
  const [noiDung, setNoiDung] = useState('');
  const [phanLoai, setPhanLoai] = useState('An ninh');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/feedback', { 
        noiDung, 
        phanLoai,
        nguoiPhanAnh: "Tên từ Token" // Backend sẽ tự xử lý hoặc lấy từ form
      });
      alert('Gửi phản ánh thành công!');
      setNoiDung('');
    } catch (err) {
      alert('Lỗi khi gửi phản ánh');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gửi phản ánh, kiến nghị</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Loại phản ánh</label>
          <select 
            className="w-full p-3 rounded-xl border border-gray-200"
            value={phanLoai}
            onChange={(e) => setPhanLoai(e.target.value)}
          >
            <option>An ninh</option>
            <option>Vệ sinh môi trường</option>
            <option>Hạ tầng</option>
            <option>Khác</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nội dung chi tiết</label>
          <textarea 
            rows={5}
            className="w-full p-3 rounded-xl border border-gray-200"
            placeholder="Mô tả rõ vấn đề bạn gặp phải..."
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            required
          />
        </div>
        <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition">
          Gửi kiến nghị
        </button>
      </form>
    </div>
  );
}