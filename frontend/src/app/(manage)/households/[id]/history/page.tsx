"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, History, Clock, User, Info, Loader2 } from "lucide-react";
import api from "@/src/lib/api";

const HouseholdHistoryPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/households/${id}/history`);
        setHistory(res.data || []);
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHistory();
  }, [id]);

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'TAO_MOI': return { label: "Tạo mới", color: "text-green-600 bg-green-50" };
      case 'CAP_NHAT': return { label: "Cập nhật", color: "text-blue-600 bg-blue-50" };
      case 'DOI_CHU_HO': return { label: "Đổi chủ hộ", color: "text-purple-600 bg-purple-50" };
      case 'TACH_HO': return { label: "Tách hộ", color: "text-orange-600 bg-orange-50" };
      case 'DONG_SO': return { label: "Đóng sổ", color: "text-red-600 bg-red-50" };
      default: return { label: action, color: "text-gray-600 bg-gray-50" };
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={20} /> Quay lại chi tiết hộ
      </button>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 rounded-2xl text-white"><History size={24} /></div>
        <h1 className="text-3xl font-bold text-gray-900">Lịch sử biến động hộ khẩu</h1>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Chưa có ghi nhận biến động nào.</p>
        ) : (
          history.map((item, index) => {
            const actionInfo = getActionLabel(item.action);
            return (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-100 group-hover:bg-blue-600 group-hover:text-white text-gray-400 transition-all shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Clock size={18} />
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[45%] bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${actionInfo.color}`}>
                      {actionInfo.label}
                    </span>
                    <time className="text-xs text-gray-400 font-medium">
                      {new Date(item.date).toLocaleString('vi-VN')}
                    </time>
                  </div>
                  <p className="text-gray-800 font-semibold mb-3">{item.content}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                    <User size={14} className="text-blue-400" />
                    <span>Thực hiện bởi: <b>{item.performedBy?.fullName || "Hệ thống"}</b></span>
                  </div>
                  {item.detail && (
                    <div className="mt-3 p-3 bg-blue-50/50 rounded-xl text-[11px] text-blue-700 space-y-1">
                       <p className="flex items-start gap-1"><Info size={12} className="mt-0.5 shrink-0" /> Chi tiết: {JSON.stringify(item.detail)}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HouseholdHistoryPage;