"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCcw, Info, Loader2 } from 'lucide-react';
import api from '@/src/lib/api'; // Tận dụng axios instance đã có trong dự án của bạn

interface Message {
  role: 'bot' | 'user';
  content: string;
}

const ChatbotPage = () => {
  // 1. Quản lý danh sách tin nhắn và input
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Chào cán bộ! Tôi là Trợ lý ảo E-Resident. Tôi có thể giúp gì cho bạn trong việc tra cứu nhân khẩu hoặc soạn thảo văn bản không?' },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`); // Tạo ID phiên để Backend AI ghi nhớ ngữ cảnh

  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // 3. Hàm gửi tin nhắn tới Backend
  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/chatbot/ask', {
        message: userMessage,
        sessionId: sessionId
      });

      // Xử lý linh hoạt các kiểu dữ liệu trả về từ proxy NestJS
      let botReply = "";
      if (typeof response.data.reply === 'string') {
        botReply = response.data.reply;
      } else if (response.data.reply?.response) {
        botReply = response.data.reply.response;
      } else {
        botReply = JSON.stringify(response.data.reply);
      }

      setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      const errorMsg = error.response?.data?.message || "Mất kết nối với máy chủ AI (ngrok).";
      setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleReset = () => {
    setMessages([{ role: 'bot', content: 'Đã làm mới cuộc hội thoại. Tôi có thể giúp gì thêm cho bạn?' }]);
  };

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
              <span className={`w-2 h-2 ${loading ? 'bg-orange-500 animate-bounce' : 'bg-green-500'} rounded-full`}></span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {loading ? "AI đang suy nghĩ..." : "Sẵn sàng hỗ trợ"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors"
        >
          <RefreshCcw size={16} /> Làm mới cuộc hội thoại
        </button>
      </div>

      {/* Khung Chat */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-blue-50 text-blue-600' : 'bg-slate-900 text-white'
                }`}>
                {msg.role === 'bot' ? <Sparkles size={20} /> : <User size={20} />}
              </div>
              <div className={`max-w-[75%] p-5 rounded-[2rem] text-sm leading-relaxed ${msg.role === 'bot'
                ? 'bg-gray-50 text-gray-800 rounded-tl-none'
                : 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="bg-gray-50 p-4 rounded-[2rem] rounded-tl-none">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-50">
          <div className="relative flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Hỏi tôi về dân số, hộ khẩu hoặc thủ tục..."
                className="w-full pl-6 pr-12 py-4 bg-white border-none rounded-3xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all disabled:bg-gray-300"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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