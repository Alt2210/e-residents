"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Calendar, Loader2, Inbox, Check, X, Search } from 'lucide-react';
import api from "@/src/lib/api";

const ResidencePage = () => {
  const [tab, setTab] = useState('tam-tru'); // 'tam-tru' | 'tam-vang' | 'yeu-cau'
  const [residenceList, setResidenceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm lấy dữ liệu từ API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Xác định endpoint dựa trên Tab
      // Tab 'yeu-cau' thực chất là tìm kiếm TemporaryResidence với trạng thái CHO_DUYET
      const endpoint = (tab === 'tam-tru' || tab === 'yeu-cau') 
        ? "/residence/temporary/search" 
        : "/residence/absence/search";

      /**
       * CẤU HÌNH PARAMS KHỚP CHÍNH XÁC VỚI DTO BACKEND:
       * - Không gửi 'keyword' nếu Backend DTO chưa khai báo trường này để tránh lỗi 400 (forbidNonWhitelisted)
       * - Sử dụng 'trangThai' thay vì 'status'
       */
      const params: any = {
        page: 1,
        limit: 50,
        trangThai: tab === 'yeu-cau' ? 'CHO_DUYET' : 'HIEU_LUC'
      };

      // Lưu ý: Chỉ bỏ comment dòng dưới nếu bạn đã thêm @IsString() keyword?: string vào file Backend DTO
      // if (searchTerm.trim()) params.keyword = searchTerm.trim();

      const response = await api.get(endpoint, { params });

      // Xử lý dữ liệu trả về
      let finalData = [];
      if (Array.isArray(response.data)) {
        finalData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        finalData = response.data.data;
      }

      setResidenceList(finalData);
    } catch (error: any) {
      console.error("Lỗi API (400 Bad Request): Hãy kiểm tra xem params có dư thừa trường nào không.");
      setResidenceList([]);
    } finally {
      setLoading(false);
    }
  }, [tab]); // Chỉ fetch lại khi chuyển Tab. Nếu dùng tìm kiếm thực thụ, thêm searchTerm vào đây.

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Phê duyệt yêu cầu (Chuyển CHO_DUYET thành HIEU_LUC)
  const handleApprove = async (id: string) => {
    if (!confirm("Bạn có đồng ý phê duyệt yêu cầu này không?")) return;
    try {
      // Sử dụng PUT/PATCH tùy theo route bạn định nghĩa ở Backend để cập nhật trangThai
      await api.put(`/residence/temporary/${id}`, { trangThai: 'HIEU_LUC' });
      alert("Đã phê duyệt thành công!");
      fetchData();
    } catch (error) {
      alert("Lỗi khi phê duyệt. Đảm bảo Backend có route PUT /residence/temporary/:id");
    }
  };

  // Kết thúc hoặc Từ chối yêu cầu
  const handleClose = async (id: string) => {
    const actionText = tab === 'yeu-cau' ? "từ chối yêu cầu" : "kết thúc bản ghi";
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} này?`)) return;
    
    try {
      const endpoint = (tab === 'tam-tru' || tab === 'yeu-cau')
        ? `/residence/temporary/${id}/close`
        : `/residence/absence/${id}/close`;
      
      await api.patch(endpoint, { closeDate: new Date() }); 
      alert("Thao tác thành công");
      fetchData();
    } catch (error) {
      alert("Không thể thực hiện thao tác này.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-google-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Biến động cư trú</h2>
          <p className="text-gray-500 text-sm italic">Quản lý tạm trú, tạm vắng và duyệt yêu cầu công dân</p>
        </div>
        
        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 flex gap-1 shadow-sm">
          <button 
            onClick={() => setTab('tam-tru')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'tam-tru' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Tạm trú
          </button>
          <button 
            onClick={() => setTab('tam-vang')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'tam-vang' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Tạm vắng
          </button>
          <button 
            onClick={() => setTab('yeu-cau')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'yeu-cau' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Inbox size={14}/> Yêu cầu mới
          </button>
        </div>
      </div>

      {/* Ô tìm kiếm (Chỉ hoạt động nếu Backend DTO có trường keyword) */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : residenceList.length > 0 ? (
          residenceList.map((item: any) => (
            <div key={item._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-wrap md:flex-nowrap items-center gap-6 shadow-sm group hover:shadow-md transition-all">
              
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 
                ${tab === 'yeu-cau' ? 'bg-orange-50 text-orange-600' : 
                  tab === 'tam-tru' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                <FileText size={32} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-lg font-bold text-gray-900 truncate">
                    {item.personId?.hoTen || "N/A"}
                  </h4>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded-lg uppercase font-bold tracking-tighter">
                    {item.personId?.soCCCD || "CHƯA CÓ CCCD"}
                  </span>
                  {tab === 'yeu-cau' && (
                    <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-lg font-bold italic">CHỜ PHÊ DUYỆT</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium mb-2">
                    Địa chỉ: {item.diaChiTamTru || item.noiDen || "N/A"}
                </p>
                <p className="text-xs text-gray-400 mb-2 italic">Lý do: {item.lyDo || "N/A"}</p>
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium font-mono">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                    <Calendar size={14}/> 
                    Từ: {item.tuNgay ? new Date(item.tuNgay).toLocaleDateString('vi-VN') : '...'}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                    <Clock size={14}/> 
                    Đến: {item.denNgay ? new Date(item.denNgay).toLocaleDateString('vi-VN') : '...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {tab === 'yeu-cau' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(item._id)}
                      className="bg-green-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-green-700 flex items-center gap-2 shadow-sm"
                    >
                      <Check size={18} /> Duyệt
                    </button>
                    <button 
                      onClick={() => handleClose(item._id)}
                      className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                    >
                      <X size={18} /> Từ chối
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 pr-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Trạng thái</p>
                      <span className={`flex items-center justify-end gap-1.5 font-bold text-sm italic ${item.trangThai === 'DA_DONG' ? 'text-gray-400' : 'text-green-600'}`}>
                        <CheckCircle2 size={16} /> {item.trangThai === 'DA_DONG' ? 'Đã kết thúc' : 'Đang hiệu lực'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleClose(item._id)}
                      disabled={item.trangThai === 'DA_DONG'}
                      className={`p-3 rounded-2xl transition-all ${item.trangThai === 'DA_DONG' ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600'}`}
                      title="Kết thúc bản ghi"
                    >
                      <AlertCircle size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
             <Inbox size={40} className="text-gray-300" />
             <p className="text-gray-400 font-medium font-google-sans">Hiện không có bản ghi hoặc yêu cầu nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidencePage;