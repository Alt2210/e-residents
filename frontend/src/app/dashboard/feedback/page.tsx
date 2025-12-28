"use client";

import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, User, Filter, Search, Send } from 'lucide-react';

const FeedbackPage = () => {
  const [selectedId, setSelectedId] = useState("FB001");

  const feedbacks = [
    { id: "FB001", user: "Nguyễn Văn A", title: "Vấn đề vệ sinh khu phố", status: "Chưa xử lý", date: "2 giờ trước" },
    { id: "FB002", user: "Lê Thị B", title: "Hệ thống chiếu sáng hỏng", status: "Đang xử lý", date: "1 ngày trước" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hộp thư Phản ánh</h2>
          <p className="text-gray-500 mt-1">Lắng nghe và giải quyết các kiến nghị của cư dân địa phương</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar Danh sách */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Tìm kiếm phản ánh..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
          </div>
          
          {feedbacks.map((f) => (
            <div 
              key={f.id}
              onClick={() => setSelectedId(f.id)}
              className={`p-4 rounded-[2rem] cursor-pointer transition-all border ${
                selectedId === f.id ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'bg-white border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                  selectedId === f.id ? 'bg-blue-500 text-white' : 'bg-orange-50 text-orange-600'
                }`}>{f.status}</span>
                <span className={`text-[10px] ${selectedId === f.id ? 'text-blue-100' : 'text-gray-400'}`}>{f.date}</span>
              </div>
              <h4 className={`font-bold text-sm mb-1 ${selectedId === f.id ? 'text-white' : 'text-gray-800'}`}>{f.title}</h4>
              <p className={`text-xs flex items-center gap-1 ${selectedId === f.id ? 'text-blue-100' : 'text-gray-500'}`}>
                <User size={12} /> {f.user}
              </p>
            </div>
          ))}
        </div>

        {/* Nội dung chi tiết */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {feedbacks.find(f => f.id === selectedId)?.user.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Mã phản ánh: {selectedId}</h3>
                <p className="text-sm text-gray-500">Gửi bởi: Nguyễn Văn An • Cư dân HK001</p>
              </div>
            </div>
            <button className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">Đánh dấu xử lý xong</button>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="bg-gray-50 p-6 rounded-[2rem] border-l-4 border-blue-500">
              <h5 className="font-bold text-gray-800 mb-2">Nội dung chi tiết:</h5>
              <p className="text-gray-600 leading-relaxed italic">
                "Kính gửi ban quản lý, hiện tại khu vực ngõ 10 Tạ Quang Bửu túi rác thải đang bị ùn ứ quá nhiều, gây mùi hôi thối ảnh hưởng đến đời sống người dân. Kính mong cơ quan chức năng sớm giải quyết."
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="font-bold text-gray-800 flex items-center gap-2">
                <Send size={18} className="text-blue-500" /> Phản hồi cho cư dân
              </h5>
              <textarea 
                placeholder="Nhập nội dung phản hồi tại đây..." 
                className="w-full h-32 p-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-500 transition-all text-sm outline-none shadow-inner"
              />
              <div className="flex justify-end">
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all">
                  Gửi phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;