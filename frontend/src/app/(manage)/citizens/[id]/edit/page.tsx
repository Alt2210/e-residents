"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Loader2 } from "lucide-react";
import api from "@/src/lib/api";

const EditCitizenPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    hoTen: "",
    biDanh: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    noiSinh: "",
    nguyenQuan: "",
    danToc: "Kinh",
    tonGiao: "Không",
    quocTich: "Việt Nam",
    soCCCD: "",
    ngayCapCCCD: "",
    noiCapCCCD: "",
    ngheNghiep: "",
    noiLamViec: "",
    householdId: "",
    quanHeVoiChuHo: "",
    ngayDangKyThuongTru: "",
    diaChiThuongTruTruoc: ""
  });

  // 1. Tải dữ liệu hiện tại của nhân khẩu
  useEffect(() => {
    const fetchCitizenData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/persons/${id}`); // Gọi PersonsController.getDetail
        const data = response.data;

        // Định dạng lại ngày tháng để hiển thị trong input type="date"
        const formatDate = (dateStr: string) => 
          dateStr ? new Date(dateStr).toISOString().split('T')[0] : "";

        setFormData({
          ...data,
          ngaySinh: formatDate(data.ngaySinh),
          ngayCapCCCD: formatDate(data.ngayCapCCCD),
          ngayDangKyThuongTru: formatDate(data.ngayDangKyThuongTru),
          householdId: data.householdId?._id || data.householdId // Lấy ID hộ khẩu
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        alert("Không thể tải thông tin nhân khẩu");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCitizenData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData: any = { ...formData };
    
    // Xử lý các trường ngày tháng để tránh lỗi ISO 8601 nếu để trống
    if (!submitData.ngayCapCCCD) delete submitData.ngayCapCCCD;

    try {
      // Gọi PersonsController.update
      await api.put(`/persons/${id}`, submitData);
      alert("Cập nhật thông tin thành công!");
      router.push(`/citizens/${id}`); // Quay lại trang chi tiết
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error.response?.data);
      alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto font-google-sans">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Chỉnh sửa thông tin nhân khẩu</h1>
              <p className="text-blue-100 opacity-80">Cập nhật hồ sơ của công dân trong hệ thống</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột 1: Thông tin cá nhân */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Thông tin cá nhân</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
              <input required name="hoTen" value={formData.hoTen} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl  focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
                <input required type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none  rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
                <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2  focus:ring-blue-500">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số CCCD</label>
              <input name="soCCCD" value={formData.soCCCD} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2  focus:ring-blue-500" />
            </div>
          </div>

          {/* Cột 2: Thông tin cư trú & Nghề nghiệp */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Cư trú & Nghề nghiệp</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Hộ khẩu *</label>
              <input required name="householdId" value={formData.householdId} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl  focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quan hệ với chủ hộ *</label>
              <input required name="quanHeVoiChuHo" value={formData.quanHeVoiChuHo} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl   focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nghề nghiệp</label>
              <input name="ngheNghiep" value={formData.ngheNghiep} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2  focus:ring-blue-500" />
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <button 
              disabled={submitting}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {submitting ? "Đang lưu..." : <><Save size={20} /> Lưu thay đổi</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCitizenPage;