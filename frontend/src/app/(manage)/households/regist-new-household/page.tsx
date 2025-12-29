"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Home, Info, MapPin } from "lucide-react";
import api from "@/src/lib/api";

const RegistNewHouseholdPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    soHoKhau: "",
    soNha: "",
    duongPho: "",
    phuong: "",
    quan: "",
    chuHoId: "" // Có thể để trống nếu lập hộ trước, thêm nhân khẩu sau
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi API POST /households dựa trên HouseholdsController
      await api.post("/households", formData);
      alert("Lập sổ hộ khẩu mới thành công!");
      router.push("/households");
    } catch (error: any) {
      console.error("Lỗi đăng ký hộ khẩu:", error.response?.data);
      alert("Lỗi: " + (error.response?.data?.message || "Không thể tạo hộ khẩu. Vui lòng kiểm tra lại số hộ khẩu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-google-sans">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Quay lại danh sách
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-50 border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Home size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Lập Sổ Hộ Khẩu Mới</h1>
              <p className="text-blue-100 opacity-80">Đăng ký mã số hộ khẩu và địa chỉ thường trú mới</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Thông tin định danh hộ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
              <Info size={18} />
              <h3>Thông tin định danh</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số sổ hộ khẩu *</label>
                <input 
                  required 
                  name="soHoKhau" 
                  value={formData.soHoKhau} 
                  onChange={handleChange} 
                  placeholder="Ví dụ: HK2025-001"
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Chủ hộ (Tùy chọn)</label>
                <input 
                  name="chuHoId" 
                  value={formData.chuHoId} 
                  onChange={handleChange} 
                  placeholder="Nhập ID nhân khẩu nếu đã có"
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner" 
                />
              </div>
            </div>
          </section>

          {/* Thông tin địa chỉ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
              <MapPin size={18} />
              <h3>Địa chỉ thường trú</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số nhà *</label>
                <input required name="soNha" value={formData.soNha} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường/Phố *</label>
                <input required name="duongPho" value={formData.duongPho} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
                <input required name="phuong" value={formData.phuong} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                <input required name="quan" value={formData.quan} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner" />
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all disabled:bg-gray-400"
            >
              {loading ? "Đang xử lý..." : <><Save size={20} /> Xác nhận lập hộ khẩu</>}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 italic">
              * Lưu ý: Sau khi lập hộ khẩu, hãy thêm nhân khẩu và chỉ định chủ hộ trong phần chi tiết.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistNewHouseholdPage;