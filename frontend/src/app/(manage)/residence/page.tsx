"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Calendar, Loader2 } from 'lucide-react';
import api from "@/src/lib/api";

const ResidencePage = () => {
  const [tab, setTab] = useState('tam-tru'); // 'tam-tru' hoặc 'tam-vang'
  const [residenceList, setResidenceList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Endpoint khớp chính xác với Controller: /residence/temporary/search hoặc /residence/absence/search
      const endpoint = tab === 'tam-tru' 
        ? "/residence/temporary/search" 
        : "/residence/absence/search";
      
      const response = await api.get(endpoint);

      // SỬA LỖI .map: Kiểm tra kỹ cấu trúc response
      // 1. Nếu response.data là mảng trực tiếp
      // 2. Nếu response.data là object có chứa mảng (ví dụ: { data: [...], total: 10 })
      let finalData = [];
      if (Array.isArray(response.data)) {
        finalData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        finalData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Trường hợp API trả về object mà dữ liệu nằm trong 1 field khác
        finalData = Object.values(response.data).find(val => Array.isArray(val)) || [];
      }

      setResidenceList(finalData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu cư trú:", error);
      setResidenceList([]); // Trả về mảng rỗng để không bị lỗi .map
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleClose = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn kết thúc bản ghi này?")) return;
    try {
      const endpoint = tab === 'tam-tru'
        ? `/residence/temporary/${id}/close`
        : `/residence/absence/${id}/close`;
      
      // Theo controller, Patch close có nhận Body (CloseResidenceDto), truyền {} nếu không có dữ liệu
      await api.patch(endpoint, {}); 
      alert("Thao tác thành công");
      fetchData();
    } catch (error) {
      alert("Không thể thực hiện thao tác này. Vui lòng kiểm tra quyền hạn.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Biến động cư trú</h2>
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (Array.isArray(residenceList) && residenceList.length > 0) ? (
          residenceList.map((item: any) => (
            <div key={item._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-wrap md:flex-nowrap items-center gap-6 shadow-sm group hover:shadow-md transition-all">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${tab === 'tam-tru' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                <FileText size={32} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-lg font-bold text-gray-900 truncate">
                    {item.personId?.fullName || "N/A"}
                  </h4>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-tighter">
                    {item.personId?.idCard || "Chưa có CCCD"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2 italic">Lý do: {item.reason || "N/A"}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar size={14}/> Từ: {item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : '...'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14}/> Đến: {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pr-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Trạng thái</p>
                  <span className={`flex items-center justify-end gap-1.5 font-bold text-sm italic ${item.status === 'CLOSED' ? 'text-gray-400' : 'text-green-600'}`}>
                    <CheckCircle2 size={16} /> {item.status === 'CLOSED' ? 'Đã kết thúc' : 'Đang hiệu lực'}
                  </span>
                </div>
                <button 
                  onClick={() => handleClose(item._id)}
                  disabled={item.status === 'CLOSED'}
                  className={`p-3 rounded-2xl transition-all ${item.status === 'CLOSED' ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600'}`}
                >
                  <AlertCircle size={24} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-[2rem] border border-dashed border-gray-200 text-center text-gray-400">
            Hiện không có bản ghi nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidencePage;