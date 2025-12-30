"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Home, 
  MapPin, 
  User as UserIcon, 
  Users, 
  Calendar, 
  Loader2, 
  Edit,
  History,
  CheckCircle2,
  XCircle
} from "lucide-react";
import api from "@/src/lib/api";

const HouseholdDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Gọi API getDetail từ HouseholdsController
        // Backend trả về { household: ..., persons: [...] }
        const res = await api.get(`/households/${id}`);
        setData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết hộ khẩu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
        <p className="text-gray-500 font-medium">Đang tải hồ sơ hộ khẩu...</p>
      </div>
    </div>
  );

  if (!data || !data.household) return (
    <div className="p-20 text-center text-red-500">
      Không tìm thấy dữ liệu hộ khẩu.
    </div>
  );

  const { household, persons } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Thanh điều hướng nhanh */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Quay lại danh sách
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/households/${id}/history`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all text-sm font-semibold"
          >
            <History size={18} /> Lịch sử biến động
          </button>
          <button 
            onClick={() => router.push(`/households/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 transition-all text-sm font-semibold"
          >
            <Edit size={18} /> Chỉnh sửa sổ
          </button>
        </div>
      </div>

      {/* Card Thông tin chính */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className={`p-8 text-white ${household.isActive ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gray-500'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-6 items-center">
              <div className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-md">
                <Home size={40} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight">Số hộ khẩu: {household.soHoKhau}</h1>
                  {household.isActive ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-400/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 size={12} /> Đang hoạt động
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-400/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <XCircle size={12} /> Đã đóng sổ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-blue-100/80">
                  <MapPin size={18} />
                  <span className="text-lg font-medium">
                    {household.soNha}, {household.duongPho}, P. {household.phuong}, Q. {household.quan}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gray-50/30">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Chủ hộ hiện tại</p>
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {household.chuHoId?.hoTen?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-bold text-gray-900">{household.chuHoId?.hoTen || "Chưa xác định"}</p>
                <p className="text-xs text-gray-500">{household.chuHoId?.soCCCD || "Chưa có CCCD"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Thông tin quản lý</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-1">Thành viên</p>
                <p className="text-xl font-black text-blue-600">{persons?.length || 0}</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-1">Ngày lập sổ</p>
                <p className="text-sm font-bold text-gray-900">
                   {household.createdAt ? new Date(household.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách thành viên trong hộ */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Danh sách thành viên</h2>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Họ tên / CCCD</th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-center">Quan hệ</th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Ngày sinh</th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Nghề nghiệp</th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {persons && persons.length > 0 ? (
                persons.map((person: any) => (
                  <tr 
                    key={person._id} 
                    className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                    onClick={() => router.push(`/citizens/${person._id}`)}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 font-bold transition-colors">
                          {person.hoTen?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{person.hoTen}</p>
                          <p className="text-[10px] font-google-sans text-gray-400 group-hover:text-blue-500 transition-colors">
                            {person.soCCCD || "Chưa cấp CCCD"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${
                        person._id === household.chuHoId?._id 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-gray-50 text-gray-500 border border-gray-100'
                      }`}>
                        {person.quanHeVoiChuHo || "Thành viên"}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-300" />
                        {person.ngaySinh ? new Date(person.ngaySinh).toLocaleDateString('vi-VN') : "N/A"}
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-medium text-gray-700">{person.ngheNghiep || "Không có"}</p>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <UserIcon size={16} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400 italic font-medium">
                    Chưa có nhân khẩu nào được đăng ký trong hộ này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HouseholdDetailPage;