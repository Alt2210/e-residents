"use client";

import React, { useState, useEffect } from 'react';
import { 
  Send, History, MessageSquare, Clock, CheckCircle, 
  AlertCircle, ChevronRight, User as UserIcon, Calendar 
} from 'lucide-react';
import api from '@/src/lib/api';
import Modal from '@/src/components/Modal'; // Đảm bảo đường dẫn đúng
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Định nghĩa kiểu dữ liệu dựa trên FeedbackSchema
interface FeedbackResponse {
  noiDung: string;
  ngayPhanHoi: string;
  donViPhanHoi: string;
}

interface Feedback {
  _id: string;
  noiDung: string;
  phanLoai: string;
  nguoiPhanAnh: string;
  ngayPhanAnh: string;
  trangThai: 'MOI_GHI_NHAN' | 'DANG_XU_LY' | 'DA_GIAI_QUYET' | 'TAM_DUNG';
  phanHoi: FeedbackResponse[]; // Mảng các câu trả lời từ cơ quan
}

export default function FeedbackPage() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [loading, setLoading] = useState(false);
  
  // State cho Form
  const [noiDung, setNoiDung] = useState('');
  const [phanLoai, setPhanLoai] = useState('An ninh');

  // State cho History
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // State cho Modal thông báo thành công
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- LOGIC GỬI PHẢN ÁNH ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Lấy thông tin user từ localStorage để điền vào người phản ánh
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { fullName: 'Công dân ẩn danh' };

      // Gọi API POST /feedback
      await api.post('/feedback', { 
        noiDung, 
        phanLoai,
        nguoiPhanAnh: user.fullName // Backend yêu cầu trường này
      });
      
      setShowSuccessModal(true);
      setNoiDung('');
    } catch (err) {
      alert('Lỗi khi gửi phản ánh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC LẤY LỊCH SỬ ---
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user) return;

      // Gọi API Search
      // Lưu ý: Backend lọc theo tên người phản ánh
      const res = await api.get('/feedback/search', {
        params: {
          nguoiPhanAnh: user.fullName, 
          limit: 50
        }
      });
      setFeedbacks(res.data.data);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tải lại lịch sử khi chuyển tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  // --- HELPER RENDERING ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DA_GIAI_QUYET':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Đã giải quyết</span>;
      case 'DANG_XU_LY':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Đang xử lý</span>;
      case 'TAM_DUNG':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Tạm dừng</span>;
      default: // MOI_GHI_NHAN
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">Mới ghi nhận</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-google-sans min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kênh Phản Ánh - Kiến Nghị</h1>
        <p className="text-gray-500 mt-2">Gửi ý kiến đóng góp và theo dõi tiến độ xử lý từ chính quyền</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 w-fit">
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'create' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Send size={18} /> Gửi phản ánh mới
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <History size={18} /> Lịch sử của tôi
        </button>
      </div>

      {/* TAB 1: GỬI PHẢN ÁNH */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Loại phản ánh */}
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lĩnh vực phản ánh</label>
                <div className="relative">
                  <select 
                    className="w-full p-4 pl-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={phanLoai}
                    onChange={(e) => setPhanLoai(e.target.value)}
                  >
                    <option>An ninh trật tự</option>
                    <option>Vệ sinh môi trường</option>
                    <option>Hạ tầng đô thị</option>
                    <option>Thủ tục hành chính</option>
                    <option>Khác</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={20} />
                </div>
             </div>
          </div>

          {/* Nội dung */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung chi tiết</label>
            <textarea 
              rows={6}
              className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Vui lòng mô tả chi tiết sự việc, địa điểm và thời gian xảy ra..."
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Đang gửi...' : <><Send size={20} /> Gửi phản ánh ngay</>}
          </button>
        </form>
      )}

      {/* TAB 2: LỊCH SỬ */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Đang tải dữ liệu...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Bạn chưa gửi phản ánh nào.</p>
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div 
                key={fb._id} 
                onClick={() => setSelectedFeedback(fb)}
                className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                      {fb.phanLoai}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock size={12} /> {format(new Date(fb.ngayPhanAnh), "dd/MM/yyyy", { locale: vi })}
                    </span>
                  </div>
                  {getStatusBadge(fb.trangThai)}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                  {fb.noiDung}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {fb.noiDung}
                </p>

                {/* Nếu đã có phản hồi thì hiện icon báo hiệu */}
                {fb.phanHoi && fb.phanHoi.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2 text-green-600 text-sm font-medium">
                    <MessageSquare size={16} />
                    Đã có {fb.phanHoi.length} câu trả lời từ cơ quan chức năng
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* --- MODAL THÔNG BÁO THÀNH CÔNG --- */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setActiveTab('history'); // Chuyển sang tab lịch sử để xem kết quả
        }}
        title="Đã gửi thành công"
        maxWidth="max-w-sm"
        footer={
          <button 
            onClick={() => {
              setShowSuccessModal(false);
              setActiveTab('history');
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
          >
            Xem danh sách phản ánh
          </button>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <p className="text-gray-600">
            Cảm ơn bạn đã đóng góp ý kiến. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.
          </p>
        </div>
      </Modal>

      {/* --- MODAL CHI TIẾT PHẢN ÁNH & TRẢ LỜI --- */}
      <Modal
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        title="Chi tiết phản ánh"
        maxWidth="max-w-2xl"
      >
        {selectedFeedback && (
          <div className="space-y-6">
            {/* Phần câu hỏi của dân */}
            <div className="bg-gray-50 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <UserIcon size={18} />
                  <span>Người dân phản ánh</span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(selectedFeedback.ngayPhanAnh), "HH:mm dd/MM/yyyy", { locale: vi })}
                </span>
              </div>
              <p className="text-gray-800 leading-relaxed font-medium">
                {selectedFeedback.noiDung}
              </p>
              <div className="flex gap-2 pt-2">
                {getStatusBadge(selectedFeedback.trangThai)}
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500">
                  {selectedFeedback.phanLoai}
                </span>
              </div>
            </div>

            {/* Phần trả lời của quan (Loop qua mảng phanHoi) */}
            {selectedFeedback.phanHoi && selectedFeedback.phanHoi.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 ml-2">Phản hồi từ cơ quan chức năng</h4>
                {selectedFeedback.phanHoi.map((resp, idx) => (
                  <div key={idx} className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl relative ml-4 md:ml-8">
                    {/* Đường nối giả lập Thread */}
                    <div className="absolute -left-4 md:-left-8 top-8 w-4 md:w-8 h-[2px] bg-blue-100"></div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-blue-800 font-bold">
                        <CheckCircle size={18} />
                        <span>{resp.donViPhanHoi || "Cán bộ xử lý"}</span>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {resp.ngayPhanHoi ? format(new Date(resp.ngayPhanHoi), "dd/MM/yyyy", { locale: vi }) : "Vừa xong"}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {resp.noiDung}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-yellow-50 rounded-2xl border border-yellow-100 text-yellow-700 text-sm flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                Chưa có phản hồi nào từ cơ quan chức năng.
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}