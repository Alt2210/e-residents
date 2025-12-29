"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, User, Filter, Search, Send } from 'lucide-react';
import api from '@/src/lib/api'; // Giả định axios instance đã cấu hình

const FeedbackPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [responseContent, setResponseContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1. Lấy danh sách phản ánh
  const fetchFeedbacks = async (keyword = "") => {
    try {
      setLoading(true);
      const response = await api.get('/feedback/search', {
        params: { keyword, limit: 15 }
      });
      setFeedbacks(response.data.data);
      if (response.data.data.length > 0 && !selectedId) {
        setSelectedId(response.data.data[0]._id);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách phản ánh:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lấy chi tiết khi chọn một phản ánh
  useEffect(() => {
    if (selectedId) {
      api.get(`/feedback/${selectedId}`)
        .then(res => setDetail(res.data))
        .catch(err => console.error("Lỗi tải chi tiết:", err));
    }
  }, [selectedId]);

  // 3. Tìm kiếm với debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFeedbacks(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 4. Gửi phản hồi
  const handleSendResponse = async () => {
    if (!responseContent.trim() || !selectedId) return;
    try {
      setSubmitting(true);
      await api.post(`/feedback/${selectedId}/response`, {
        responseContent: responseContent,
        agencyName: "Ban Quản Lý Tổ Dân Phố" // Tên đơn vị phản hồi
      });
      setResponseContent("");
      // Refresh dữ liệu
      const res = await api.get(`/feedback/${selectedId}`);
      setDetail(res.data);
      fetchFeedbacks(searchTerm);
      alert("Đã gửi phản hồi thành công!");
    } catch (error) {
      alert("Lỗi khi gửi phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm helper để hiển thị nhãn trạng thái
  const getStatusLabel = (status: string) => {
    const map: any = {
      'MOI_GHI_NHAN': { text: 'Mới', class: 'bg-orange-50 text-orange-600' },
      'DANG_XU_LY': { text: 'Đang xử lý', class: 'bg-blue-50 text-blue-600' },
      'DA_GIAI_QUYET': { text: 'Đã giải quyết', class: 'bg-green-50 text-green-600' },
      'TAM_DUNG': { text: 'Tạm dừng', class: 'bg-gray-50 text-gray-600' },
    };
    return map[status] || { text: status, class: 'bg-gray-50' };
  };

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
            <input 
              type="text" 
              placeholder="Tìm kiếm phản ánh..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
            />
          </div>
          
          {loading ? (
            <div className="text-center text-sm text-gray-400 py-10">Đang tải...</div>
          ) : feedbacks.map((f: any) => (
            <div 
              key={f._id}
              onClick={() => setSelectedId(f._id)}
              className={`p-4 rounded-[2rem] cursor-pointer transition-all border ${
                selectedId === f._id ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'bg-white border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                  selectedId === f._id ? 'bg-blue-500 text-white' : getStatusLabel(f.trangThai).class
                }`}>
                  {getStatusLabel(f.trangThai).text}
                </span>
                <span className={`text-[10px] ${selectedId === f._id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(f.ngayPhanAnh).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h4 className={`font-bold text-sm mb-1 truncate ${selectedId === f._id ? 'text-white' : 'text-gray-800'}`}>
                {f.noiDung}
              </h4>
              <p className={`text-xs flex items-center gap-1 ${selectedId === f._id ? 'text-blue-100' : 'text-gray-500'}`}>
                <User size={12} /> {f.nguoiPhanAnh}
              </p>
            </div>
          ))}
        </div>

        {/* Nội dung chi tiết */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {detail ? (
            <>
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {detail.nguoiPhanAnh.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">Mã: {detail._id.substring(detail._id.length - 6)}</h3>
                    <p className="text-sm text-gray-500">
                      Gửi bởi: {detail.nguoiPhanAnh} • {detail.reporterPersonId?.hoTen ? `Cư dân: ${detail.reporterPersonId.hoTen}` : 'Khách'}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-xs font-bold ${getStatusLabel(detail.trangThai).class}`}>
                  {getStatusLabel(detail.trangThai).text}
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="bg-gray-50 p-6 rounded-[2rem] border-l-4 border-blue-500">
                  <h5 className="font-bold text-gray-800 mb-2 flex justify-between">
                    Nội dung chi tiết:
                    <span className="text-xs font-normal text-gray-400 italic">Loại: {detail.phanLoai || 'Chung'}</span>
                  </h5>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{detail.noiDung}"
                  </p>
                </div>

                {/* Danh sách phản hồi cũ nếu có */}
                {detail.phanHoi && detail.phanHoi.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-gray-800 text-sm">Lịch sử phản hồi:</h5>
                    {detail.phanHoi.map((item: any, idx: number) => (
                      <div key={idx} className="bg-blue-50/50 p-4 rounded-2xl text-sm border border-blue-100">
                        <p className="text-gray-700">{item.noiDung}</p>
                        <p className="text-[10px] text-blue-500 mt-1">Bởi: {item.donViPhanHoi} • {new Date(item.ngayPhanHoi).toLocaleString('vi-VN')}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <h5 className="font-bold text-gray-800 flex items-center gap-2">
                    <Send size={18} className="text-blue-500" /> {detail.trangThai === 'DA_GIAI_QUYET' ? 'Gửi phản hồi bổ sung' : 'Phản hồi cho cư dân'}
                  </h5>
                  <textarea 
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    placeholder="Nhập nội dung phản hồi tại đây..." 
                    className="w-full h-32 p-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-500 transition-all text-sm outline-none shadow-inner"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handleSendResponse}
                      disabled={submitting || !responseContent.trim()}
                      className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                    >
                      {submitting ? "Đang gửi..." : "Gửi phản hồi"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 italic">
              Chọn một phản ánh để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;