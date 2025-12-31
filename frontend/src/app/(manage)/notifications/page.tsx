"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Gọi API lấy thông báo
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Lỗi tải thông báo", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Đánh dấu đã đọc 1 cái
  const markRead = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Cập nhật UI local
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  // Đánh dấu đọc tất cả
  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  // Helper render icon theo type
  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="text-green-500" />;
      case 'WARNING': return <AlertTriangle className="text-yellow-500" />;
      case 'ERROR': return <XCircle className="text-red-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Thông báo</h2>
            <p className="text-gray-500">Cập nhật tin tức mới nhất từ hệ thống</p>
          </div>
        </div>
        
        <button 
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-sm text-sm font-medium"
        >
          <Check size={16} /> Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Bell size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif._id}
              onClick={() => !notif.isRead && markRead(notif._id)}
              className={`
                relative p-5 rounded-2xl border transition-all cursor-pointer flex gap-4
                ${notif.isRead ? 'bg-white border-gray-100 text-gray-600' : 'bg-blue-50/50 border-blue-100 shadow-sm'}
                hover:shadow-md
              `}
            >
              <div className="mt-1 flex-shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`text-lg ${notif.isRead ? 'font-medium' : 'font-bold text-gray-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="mt-1 text-sm opacity-90">{notif.message}</p>
              </div>
              
              {!notif.isRead && (
                <div className="absolute top-5 right-5 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;