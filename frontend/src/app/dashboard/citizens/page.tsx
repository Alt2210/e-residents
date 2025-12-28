"use client";

import React, { useState } from "react";
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
  MoreVertical
} from "lucide-react";

const CitizensPage = () => {
  // Mock data tập trung vào định danh cá nhân
  const [citizens] = useState([
    {
      soCCCD: "037090001234",
      hoTen: "Nguyễn Văn An",
      ngaySinh: "15/05/1990",
      gioiTinh: "Nam",
      danToc: "Kinh",
      ngheNghiep: "Kỹ sư phần mềm",
      diaChiHienTai: "Số 10, Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội",
      status: "Thường trú"
    },
    {
      soCCCD: "037092005678",
      hoTen: "Lê Thị Bình",
      ngaySinh: "20/10/1992",
      gioiTinh: "Nữ",
      danToc: "Kinh",
      ngheNghiep: "Giáo viên",
      diaChiHienTai: "Phòng 502, Chung cư BlueStar, Gia Lâm, Hà Nội",
      status: "Tạm trú"
    }
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-google-sans">
      {/* Header trang nội bộ */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cơ sở dữ liệu nhân khẩu</h2>
          <p className="text-gray-500 mt-1">Tra cứu và quản lý thông tin chi tiết công dân theo số CCCD</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:scale-95 font-semibold">
          <UserPlus size={20} />
          Đăng ký nhân khẩu mới
        </button>
      </div>

      {/* Bộ lọc & Tìm kiếm hiện đại */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[450px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo Số định danh (CCCD), Họ tên hoặc Địa chỉ..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 shadow-inner"
          />
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 flex items-center gap-2 text-gray-600 font-medium transition-colors">
            <Filter size={20} />
            Bộ lọc
          </button>
          <div className="h-10 w-px bg-gray-200 mx-1"></div>
          <select className="bg-transparent font-semibold text-gray-600 outline-none cursor-pointer">
            <option>Mới nhất</option>
            <option>Tên A-Z</option>
            <option>Năm sinh</option>
          </select>
        </div>
      </div>

      {/* Danh sách Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Thông tin cá nhân</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest text-center text-nowrap">Giới tính / Dân tộc</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Nghề nghiệp</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Địa chỉ hiện tại</th>
                <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {citizens.map((person) => (
                <tr key={person.soCCCD} className="hover:bg-blue-500/30 transition-all group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {person.hoTen.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{person.hoTen}</p>
                        <div className="flex items-center gap-1.5 text-blue-600 font-mono text-sm font-medium mt-0.5">
                          <CreditCard size={14} />
                          {person.soCCCD}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter ${
                        person.gioiTinh === 'Nam' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {person.gioiTinh}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{person.danToc}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-semibold text-gray-700">{person.ngheNghiep}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar size={12} />
                      Sinh: {person.ngaySinh}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-1.5 max-w-[250px]">
                      <MapPin size={16} className="text-gray-300 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-500 leading-relaxed italic">{person.diaChiHienTai}</p>
                    </div>
                  </td>
                  <td className="p-5 text-right uppercase">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                      <button title="Chỉnh sửa" className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button title="Khai báo vắng mặt" className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                        <UserMinus size={18} />
                      </button>
                      <button title="Khai tử" className="p-2.5 text-gray-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                        <Ghost size={18} />
                      </button>
                      <button title="Xóa hồ sơ" className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CitizensPage;