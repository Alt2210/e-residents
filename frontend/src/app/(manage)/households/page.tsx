"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Search, Plus, Users, MapPin, ArrowRightLeft, Split, UserCheck } from 'lucide-react';
import api from '@/src/lib/api'; // Giả định bạn dùng axios instance đã cấu hình

const HouseholdsPage = () => {
  const router = useRouter();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm gọi API lấy danh sách hộ khẩu
  const fetchHouseholds = async (keyword = "") => {
    try {
      setLoading(true);
      // Gọi API search của HouseholdsController
      const response = await api.get(`/households/search`, {
        params: { 
          keyword,
          limit: 20 // Tăng giới hạn hiển thị
        }
      });
      setHouseholds(response.data.data); // Backend trả về { data, total, page... }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hộ khẩu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API lần đầu và khi searchTerm thay đổi (có thể thêm debounce nếu cần)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHouseholds(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sổ quản lý hộ khẩu</h2>
          <p className="text-gray-500 mt-1">Quản lý danh sách hộ gia đình và hồ sơ cư trú địa phương</p>
        </div>
        <button 
          onClick={() => router.push("/households/regist-new-household")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-semibold"
        >
            <Plus size={20} /> Tách/Lập hộ mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo mã hộ khẩu, tên chủ hộ hoặc địa chỉ..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Đang tải dữ liệu hộ khẩu...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {households.map((h) => (
            <div key={h._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <Home size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button title="Đổi chủ hộ" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><UserCheck size={18} /></button>
                  <button title="Tách hộ" className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"><Split size={18} /></button>
                  <button title="Chuyển hộ" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><ArrowRightLeft size={18} /></button>
                </div>
              </div>
              <div>
                {/* h.chuHoId.hoTen được populate từ bảng Person */}
                <h3 className="text-xl font-bold text-gray-900">
                  {h.chuHoId?.hoTen || "Chưa xác định chủ hộ"}
                </h3>
                {/* Backend sử dụng trường soHoKhau */}
                <p className="text-sm font-mono text-blue-600 font-semibold mb-3">Số hộ khẩu: {h.soHoKhau}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} /> 
                    {/* Kết hợp các trường địa chỉ từ Schema */}
                    {`${h.soNha}, ${h.duongPho}, ${h.phuong}, ${h.quan}`}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={14} /> 
                    {/* Trường này bạn có thể bổ sung API count nhân khẩu hoặc hiển thị tạm */}
                    Hộ khẩu đang hoạt động
                  </div>
                </div>
              </div>
              <button 
                onClick={() => window.location.href = `/households/${h._id}`}
                className="mt-6 w-full py-3 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-600 rounded-2xl font-bold text-sm transition-all"
              >
                Xem chi tiết hồ sơ hộ
              </button>
            </div>
          ))}
          {!loading && households.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400 italic">
              Không tìm thấy hộ khẩu nào phù hợp.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HouseholdsPage;