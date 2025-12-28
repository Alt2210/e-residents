"use client";

import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, RefreshCcw, Info } from 'lucide-react';

const ChatbotPage = () => {
  const [messages] = useState([
    { role: 'bot', content: 'Chào cán bộ! Tôi là Trợ lý ảo E-Resident. Tôi có thể giúp gì cho bạn trong việc tra cứu nhân khẩu hoặc soạn thảo văn bản không?' },
    { role: 'user', content: 'Thống kê cho tôi số lượng nam giới trên 60 tuổi trong phường.' },
    { role: 'bot', content: 'Dựa trên dữ liệu hiện tại, phường chúng ta có 152 cư dân nam trên 60 tuổi. Trong đó có 45 người đang thuộc diện cần hỗ trợ chính sách.' },
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Trợ lý ảo AI</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sẵn sàng hỗ trợ</span>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
          <RefreshCcw size={16} /> Làm mới cuộc hội thoại
        </button>
      </div>

      {/* Khung Chat */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'bot' ? 'bg-blue-50 text-blue-600' : 'bg-slate-900 text-white'
              }`}>
                {msg.role === 'bot' ? <Sparkles size={20} /> : <User size={20} />}
              </div>
              <div className={`max-w-[70%] p-5 rounded-[2rem] text-sm leading-relaxed ${
                msg.role === 'bot' 
                  ? 'bg-gray-50 text-gray-800 rounded-tl-none' 
                  : 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-50">
          <div className="relative flex items-center gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Hỏi tôi về dân số, hộ khẩu hoặc thủ tục..."
                className="w-full pl-6 pr-12 py-4 bg-white border-none rounded-3xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all">
                <Send size={18} />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-1 uppercase font-bold tracking-widest">
            <Info size={12} /> AI có thể nhầm lẫn, hãy kiểm tra lại thông tin quan trọng
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;