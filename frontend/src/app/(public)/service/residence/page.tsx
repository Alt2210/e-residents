"use client";

import React, { useState, useEffect } from 'react';
import { 
  Send, History, Clock, CheckCircle, 
  AlertCircle, MapPin, Calendar, FileText,
  ChevronRight, Inbox, Loader2
} from 'lucide-react';
import api from '@/src/lib/api';
import Modal from '@/src/components/Modal';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ResidenceRecord {
  _id: string;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
  trangThai: 'HIEU_LUC' | 'CHO_DUYET' | 'DA_DONG' | 'DA_HUY';
  diaChiTamTru?: string; // Dành cho tạm trú
  noiDen?: string;      // Dành cho tạm vắng
  createdAt: string;
}

export default function ResidenceServicePage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [residenceType, setResidenceType] = useState<'tam-tru' | 'tam-vang'>('tam-tru');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<ResidenceRecord[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    address: '',
    fromProvince: ''
  });

  // --- LOGIC GỬI YÊU CẦU ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.soCCCD) throw new Error("Không tìm thấy thông tin định danh");

      // Lấy thông tin nhân khẩu từ CCCD
      const personRes = await api.get(`/persons/search?soCCCD=${user.soCCCD}`);
      const personId = personRes.data.data[0]?._id;

      const endpoint = residenceType === 'tam-tru' ? "/residence/temporary" : "/residence/absence";
      const payload = residenceType === 'tam-tru' ? {
        personId,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        stayingAddress: formData.address,
        fromProvinceOrAddress: formData.fromProvince,
        trangThai: 'CHO_DUYET'
      } : {
        personId,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        destination: formData.address,
        trangThai: 'CHO_DUYET'
      };

      await api.post(endpoint, payload);
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC TẢI LỊCH SỬ ---
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) return;

      const personRes = await api.get(`/persons/search?soCCCD=${user.soCCCD}`);
      const personId = personRes.data.data[0]?._id;

      // Gọi cả 2 API để gộp lịch sử
      const [tmpRes, absRes] = await Promise.all([
        api.get('/residence/temporary/search', { params: { personId, limit: 50 } }),
        api.get('/residence/absence/search', { params: { personId, limit: 50 } })
      ]);

      const combined = [...tmpRes.data.data, ...absRes.data.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecords(combined);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIEU_LUC':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Đã phê duyệt</span>;
      case 'CHO_DUYET':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">Đang chờ duyệt</span>;
      case 'DA_DONG':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">Đã kết thúc</span>;
      default:
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Đã hủy</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-google-sans min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dịch vụ Cư trú Trực tuyến</h1>
        <p className="text-gray-500 mt-2">Khai báo tạm trú, tạm vắng và theo dõi trạng thái phê duyệt</p>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 w-fit">
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'create' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Send size={18} /> Đăng ký mới
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <History size={18} /> Lịch sử yêu cầu
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex gap-4 mb-4">
             <button 
                onClick={() => setResidenceType('tam-tru')}
                className={`flex-1 py-3 rounded-2xl font-bold border-2 transition-all ${residenceType === 'tam-tru' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
             >Tạm trú</button>
             <button 
                onClick={() => setResidenceType('tam-vang')}
                className={`flex-1 py-3 rounded-2xl font-bold border-2 transition-all ${residenceType === 'tam-vang' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
             >Tạm vắng</button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Từ ngày</label>
                <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, fromDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Đến ngày</label>
                <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setFormData({...formData, toDate: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{residenceType === 'tam-tru' ? 'Địa chỉ tạm trú' : 'Nơi chuyển đến'}</label>
              <input type="text" required placeholder="Nhập địa chỉ chi tiết..." className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lý do</label>
              <textarea rows={3} required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Mô tả lý do..." onChange={e => setFormData({...formData, reason: e.target.value})} />
            </div>

            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition shadow-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} Gửi yêu cầu phê duyệt
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Đang tải lịch sử...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
              <Inbox size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Bạn chưa gửi yêu cầu cư trú nào.</p>
            </div>
          ) : (
            records.map((record) => (
              <div key={record._id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${record.diaChiTamTru ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{record.diaChiTamTru ? 'Đăng ký Tạm trú' : 'Khai báo Tạm vắng'}</h3>
                      <p className="text-xs text-gray-400 font-medium">Gửi ngày: {format(new Date(record.createdAt), "dd/MM/yyyy", { locale: vi })}</p>
                    </div>
                  </div>
                  {getStatusBadge(record.trangThai)}
                </div>

                <div className="space-y-2 border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="font-medium">Địa điểm:</span> {record.diaChiTamTru || record.noiDen}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="font-medium">Thời hạn:</span> 
                    Từ {format(new Date(record.tuNgay), "dd/MM/yyyy")} đến {format(new Date(record.denNgay), "dd/MM/yyyy")}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <AlertCircle size={14} className="text-gray-400 mt-0.5" />
                    <span className="font-medium shrink-0">Lý do:</span> 
                    <span className="italic">{record.lyDo}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); setActiveTab('history'); }} title="Gửi yêu cầu thành công" maxWidth="max-w-sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <p className="text-gray-600">Yêu cầu của bạn đã được tiếp nhận và đang chờ cơ quan chức năng phê duyệt.</p>
        </div>
      </Modal>
    </div>
  );
}