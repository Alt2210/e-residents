"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, ShieldCheck, MapPin, 
  Calendar, FileText, Info, Loader2, 
  CheckCircle2, XCircle, Clock, AlertCircle
} from 'lucide-react';
import api from "@/src/lib/api";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ResidenceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        let response;
        
        /** * Logic tìm kiếm linh hoạt:
         * Do hệ thống chia Tạm trú và Tạm vắng vào 2 endpoint khác nhau,
         * ta sẽ thử tìm kiếm ở cả hai nơi bằng keyword (ID).
         */
        try {
          // 1. Thử tìm trong bảng tạm trú
          response = await api.get(`/residence/temporary/search`, { params: { keyword: id } });
          
          // 2. Nếu không thấy, thử tìm bên tạm vắng
          if (!response.data.data || response.data.data.length === 0) {
            response = await api.get(`/residence/absence/search`, { params: { keyword: id } });
          }
        } catch (e) {
          response = await api.get(`/residence/absence/search`, { params: { keyword: id } });
        }

        const detail = response.data.data?.[0];
        if (!detail) throw new Error("Không tìm thấy thông tin bản ghi");
        
        setData(detail);
      } catch (err: any) {
        setError(err.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'HIEU_LUC': return { label: 'Đang hiệu lực', color: 'text-green-600 bg-green-50', icon: <CheckCircle2 size={20}/> };
      case 'CHO_DUYET': return { label: 'Chờ phê duyệt', color: 'text-orange-600 bg-orange-50', icon: <Clock size={20}/> };
      case 'DA_DONG': return { label: 'Đã kết thúc', color: 'text-gray-600 bg-gray-50', icon: <XCircle size={20}/> };
      case 'DA_HUY': return { label: 'Đã hủy', color: 'text-red-600 bg-red-50', icon: <AlertCircle size={20}/> };
      default: return { label: status, color: 'text-slate-600 bg-slate-50', icon: <Info size={20}/> };
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center h-screen flex flex-col justify-center items-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <p className="text-red-500 font-bold text-xl">{error}</p>
      <button onClick={() => router.back()} className="mt-6 bg-gray-100 px-6 py-2 rounded-xl text-blue-600 flex items-center gap-2 hover:bg-gray-200 transition-all">
        <ArrowLeft size={18}/> Quay lại
      </button>
    </div>
  );

  const status = getStatusInfo(data.trangThai);

  return (
    <div className="p-6 max-w-4xl mx-auto font-google-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header điều hướng */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()}
          className="p-3 hover:bg-gray-100 rounded-2xl transition-all flex items-center gap-2 text-gray-600 font-bold"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold shadow-sm ${status.color}`}>
          {status.icon} {status.label}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin nhân sự liên quan */}
        <div className="md:col-span-1 space-y-6">
          {/* Thông tin nhân khẩu gửi đơn */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <User size={24} />
              <h3 className="font-bold">Người đăng ký</h3>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-gray-900">{data.personId?.hoTen || "Không xác định"}</p>
              <p className="text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded-lg inline-block">
                CCCD: {data.personId?.soCCCD || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          {/* Thông tin cán bộ xử lý */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 text-purple-600">
              <ShieldCheck size={24} />
              <h3 className="font-bold">Người phê duyệt</h3>
            </div>
            {data.issuedByUserId ? (
              <div className="space-y-2">
                <p className="text-md font-bold text-gray-900">{data.issuedByUserId.fullName || data.issuedByUserId.username}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-extrabold bg-purple-50 px-2 py-1 rounded inline-block">Cán bộ phụ trách</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                 <Clock className="text-orange-400 mb-2" size={20} />
                 <p className="text-sm text-gray-400 italic text-center leading-relaxed">Đang chờ cán bộ khu vực tiếp nhận và xử lý...</p>
              </div>
            )}
          </div>
        </div>

        {/* Nội dung chi tiết của đơn đơn */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Chi tiết hồ sơ {data.diaChiTamTru ? "Tạm trú" : "Tạm vắng"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Từ ngày</span>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
                <Calendar size={18} className="text-blue-500"/>
                {data.tuNgay ? format(new Date(data.tuNgay), "dd/MM/yyyy", { locale: vi }) : "---"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đến ngày</span>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
                <Calendar size={18} className="text-red-500"/>
                {data.denNgay ? format(new Date(data.denNgay), "dd/MM/yyyy", { locale: vi }) : "---"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
               {data.diaChiTamTru ? "Địa chỉ tạm trú" : "Nơi chuyển đến"}
            </span>
            <div className="flex items-start gap-2 bg-gray-50 p-4 rounded-2xl text-gray-700 border border-gray-100">
              <MapPin size={20} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="font-bold">{data.diaChiTamTru || data.noiDen || "Chưa cung cấp địa chỉ"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lý do đăng ký</span>
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 text-blue-800 italic leading-relaxed font-medium">
              "{data.lyDo || "Không có lý do chi tiết kèm theo"}"
            </div>
          </div>

          {data.ghiChu && (
            <div className="space-y-2 pt-4 border-t border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phản hồi / Ghi chú</span>
              <p className="text-sm text-gray-600 bg-yellow-50/50 p-4 rounded-xl border-l-4 border-yellow-400 font-medium leading-relaxed">
                {data.ghiChu}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}