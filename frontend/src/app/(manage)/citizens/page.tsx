"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  UserMinus, 
  Ghost,
  Filter,
  CreditCard,
  MapPin,
  Calendar,
  Loader2
} from "lucide-react";
import api from "@/src/lib/api";

const CitizensPage = () => {
  const router = useRouter();
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Hàm gọi API lấy danh sách nhân khẩu
  // Sử dụng endpoint /persons/search nếu có từ khóa, ngược lại dùng /persons
  const fetchCitizens = useCallback(async () => {
    try {
      setLoading(true);
      
      const endpoint = searchTerm.trim() ? "/persons/search" : "/persons";
      const config = searchTerm.trim() ? { params: { keyword: searchTerm } } : {};
      
      const response = await api.get(endpoint, config);
      
      // Cấu trúc trả về của search là { data, total... }, của findAll là mảng
      const data = response.data.data || response.data;
      setCitizens(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách nhân khẩu:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // 2. Tự động tải lại khi searchTerm thay đổi (có thể thêm debounce nếu cần)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCitizens();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchCitizens]);

  // 3. Xử lý xóa nhân khẩu (Soft delete theo logic backend)
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ của ông/bà ${name}?`)) {
      try {
        await api.delete(`/persons/${id}`);
        alert("Đã xóa hồ sơ thành công");
        fetchCitizens();
      } catch (error: any) {
        alert("Lỗi khi xóa: " + (error.response?.data?.message || "Không xác định"));
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-google-sans">
      {/* Header & Nút Thêm mới */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cơ sở dữ liệu nhân khẩu</h2>
          <p className="text-gray-500 mt-1">Quản lý thông tin cư trú và biến động dân cư trong khu vực</p>
        </div>
        <button 
          onClick={() => router.push("/citizens/regist-new-citizen")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-semibold active:scale-95"
        >
          <UserPlus size={20} />
          Đăng ký nhân khẩu mới
        </button>
      </div>

      {/* Thanh tìm kiếm & Bộ lọc */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo họ tên, số CCCD..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 shadow-inner"
          />
        </div>
        <button className="px-5 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 flex items-center gap-2 text-gray-600 font-medium transition-colors">
          <Filter size={20} />
          Bộ lọc nâng cao
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Thông tin cá nhân</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest text-center">Giới tính / Dân tộc</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Nghề nghiệp</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Trạng thái cư trú</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-blue-600" size={40} />
                      <p className="text-gray-500 font-medium">Đang truy xuất dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : citizens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={48} className="opacity-20" />
                      <p>Không tìm thấy nhân khẩu nào khớp với yêu cầu.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                citizens.map((person: any) => (
                  <tr key={person._id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {person.hoTen.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{person.hoTen}</p>
                          <div className="flex items-center gap-1.5 text-blue-600 font-mono text-sm font-medium mt-0.5">
                            <CreditCard size={14} />
                            {person.soCCCD || "Chưa cấp CCCD"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter ${
                          person.gioiTinh === 'Nam' ? 'bg-blue-100 text-blue-700' : 
                          person.gioiTinh === 'Nữ' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {person.gioiTinh}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{person.danToc || "Kinh"}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-semibold text-gray-700">{person.ngheNghiep || "Không có"}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Calendar size={12} />
                        Sinh: {new Date(person.ngaySinh).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${
                            person.trangThai === 'THUONG_TRU' ? 'bg-green-100 text-green-700' :
                            person.trangThai === 'TAM_VANG' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                         }`}>
                           {person.trangThai}
                         </span>
                         <div className="flex items-start gap-1.5 max-w-[200px]">
                          <MapPin size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-500 truncate italic">
                            {person.householdId ? `Hộ: ${person.householdId.soHoKhau || "Đang tải"}` : "Chưa nhập hộ"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          title="Chỉnh sửa" 
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          title="Khai báo vắng mặt" 
                          className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                        >
                          <UserMinus size={18} />
                        </button>
                        <button 
                          title="Khai tử" 
                          className="p-2.5 text-gray-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        >
                          <Ghost size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(person._id, person.hoTen)}
                          title="Xóa hồ sơ" 
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CitizensPage;