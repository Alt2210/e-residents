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
  CreditCard,
  MapPin,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye
} from "lucide-react";
import api from "@/src/lib/api";

const CitizensPage = () => {
  const router = useRouter();
  const [citizens, setCitizens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    gioiTinh: "",
    trangThai: "",
    ageGroup: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 50;

  // --- HÀM HỖ TRỢ KIỂM TRA ĐỘ TUỔI ---
  const isNewborn = (birthDate: string) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMilliseconds = today.getTime() - birth.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears < 1;
  };

  const handleViewDetail = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/citizens/${id}`);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/citizens/${id}/edit`);
  };

  const handleMarkMoved = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const moveDate = prompt(`Nhập ngày chuyển đi cho ông/bà ${name} (YYYY-MM-DD):`, new Date().toISOString().split('T')[0]);
    const moveTo = prompt("Nhập nơi chuyển đến:");

    if (moveDate && moveTo) {
      try {
        await api.patch(`/persons/${id}/mark-moved`, { moveDate, moveTo });
        alert("Đã cập nhật trạng thái chuyển đi thành công");
        fetchCitizens();
      } catch (error: any) {
        alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
      }
    }
  };

  const handleMarkDeceased = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const date = prompt(`Nhập ngày qua đời của ông/bà ${name} (YYYY-MM-DD):`, new Date().toISOString().split('T')[0]);

    if (date) {
      try {
        await api.patch(`/persons/${id}/mark-deceased`, { date });
        alert("Đã cập nhật trạng thái khai tử thành công");
        fetchCitizens();
      } catch (error: any) {
        alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
      }
    }
  };

  // --- HÀM RENDER BADGE TRẠNG THÁI (Đã cập nhật Mới sinh & Tiếng Việt) ---
  const getStatusBadge = (status: string, birthDate: string) => {
    if (isNewborn(birthDate)) {
      return <span className="text-[10px] font-bold px-2 py-1 bg-pink-100 text-pink-700 rounded-lg">Mới sinh</span>;
    }

    switch (status) {
      case 'THUONG_TRU':
        return <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg">Thường trú</span>;
      case 'TAM_VANG':
        return <span className="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg">Tạm Vắng</span>;
      case 'TAM_TRU':
        return <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">Tạm trú</span>;
      case 'DA_QUA_DOI':
        return <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">Đã qua đời</span>;
      case 'DA_CHUYEN_DI':
        return <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-lg">Đã chuyển đi</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">{status}</span>;
    }
  };

  const fetchCitizens = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/persons/search", {
        params: {
          keyword: searchTerm.trim(),
          gioiTinh: filters.gioiTinh || undefined,
          trangThai: filters.trangThai || undefined,
          page: currentPage,
          limit: limit
        }
      });

      const { data, total, totalPages: totalP } = response.data;
      setCitizens(data || []);
      setTotalItems(total || 0);
      setTotalPages(totalP || 1);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, currentPage, limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCitizens();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchCitizens]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ của ông/bà ${name}?`)) {
      api.delete(`/persons/${id}`)
        .then(() => {
          alert("Đã xóa hồ sơ thành công");
          fetchCitizens();
        })
        .catch((error: any) => {
          alert("Lỗi khi xóa: " + (error.response?.data?.message || "Không xác định"));
        });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
        pages.push(
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrentPage(i); }}
            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i
              ? "bg-blue-600 text-white shadow-md shadow-blue-100"
              : "hover:bg-gray-100 text-gray-500"
              }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - range - 1 || i === currentPage + range + 1) {
        pages.push(<span key={i} className="px-1 text-gray-400">...</span>);
      }
    }
    return pages;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-google-sans">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cơ sở dữ liệu nhân khẩu</h2>
          <p className="text-gray-500 mt-1 italic">Hiển thị {citizens.length}/{totalItems} nhân khẩu (Tối đa {limit} người/trang)</p>
        </div>
        <button
          onClick={() => router.push("/citizens/regist-new-citizen")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-semibold"
        >
          <UserPlus size={20} /> Đăng ký mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, số CCCD..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-2xl border border-transparent focus-within:border-blue-500 transition-all">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filters.gioiTinh}
                onChange={(e) => setFilters({ ...filters, gioiTinh: e.target.value })}
                className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
              >
                <option value="">Giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-2xl border border-transparent focus-within:border-blue-500 transition-all">
              <select
                value={filters.trangThai}
                onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}
                className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
              >
                <option value="">Trạng thái cư trú</option>
                <option value="THUONG_TRU">Thường trú</option>
                <option value="TAM_TRU">Tạm trú</option>
                <option value="TAM_VANG">Tạm vắng</option>
                <option value="DA_CHUYEN_DI">Đã chuyển đi</option>
                <option value="DA_QUA_DOI">Đã qua đời</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Nhân khẩu</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Thông tin</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Trạng thái</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></td></tr>
              ) : citizens.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-medium">Không có dữ liệu nhân khẩu</td></tr>
              ) : (
                citizens.map((person: any) => (
                  <tr
                    key={person._id}
                    onClick={() => router.push(`/citizens/${person._id}`)}
                    className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {person.hoTen?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-none">{person.hoTen || "N/A"}</p>
                          <p className="text-[11px] text-blue-600 mt-1">{person.soCCCD || "Chưa cấp CCCD"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-gray-600">
                      <p className="font-medium text-gray-800">{person.gioiTinh} - {person.danToc || "Kinh"}</p>
                      <p className="text-gray-400 text-xs italic mt-0.5">{person.ngheNghiep || "Không có"}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                        <Calendar size={10} />
                        Sinh: {person.ngaySinh ? new Date(person.ngaySinh).toLocaleDateString('vi-VN') : "N/A"}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5">
                        {/* CẬP NHẬT: Truyền thêm ngaySinh vào getStatusBadge */}
                        {getStatusBadge(person.trangThai, person.ngaySinh)}
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <MapPin size={10} />
                          {person.householdId?.soHoKhau ? `Sổ: ${person.householdId.soHoKhau}` : "Chưa nhập hộ"}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        title="Xem chi tiết"
                        onClick={(e) => handleViewDetail(e, person._id)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                        onClick={(e) => handleEdit(e, person._id)}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                        title="Chuyển đi"
                        onClick={(e) => handleMarkMoved(e, person._id, person.hoTen)}
                      >
                        <UserMinus size={16} />
                      </button>

                      <button
                        className="p-2 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                        title="Khai tử"
                        onClick={(e) => handleMarkDeceased(e, person._id, person.hoTen)}
                      >
                        <Ghost size={16} />
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, person._id, person.hoTen)}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Xóa hồ sơ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-center bg-gray-50/30">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-20 transition-all text-gray-600 shadow-sm"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex items-center gap-1.5">{renderPageNumbers()}</div>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-20 transition-all text-gray-600 shadow-sm"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizensPage;