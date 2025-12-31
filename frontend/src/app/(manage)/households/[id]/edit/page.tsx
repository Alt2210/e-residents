"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Home, Loader2, MapPin } from "lucide-react";
import api from "@/src/lib/api";

const EditHouseholdPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    soHoKhau: "",
    soNha: "",
    duongPho: "",
    phuong: "",
    quan: ""
  });

  useEffect(() => {
    const fetchHousehold = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/households/${id}`);
        const { household } = res.data;
        setFormData({
          soHoKhau: household.soHoKhau,
          soNha: household.soNha,
          duongPho: household.duongPho,
          phuong: household.phuong,
          quan: household.quan
        });
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        alert("Không thể tải thông tin hộ khẩu");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHousehold();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/households/${id}`, formData);
      alert("Cập nhật hộ khẩu thành công!");
      router.push(`/households/${id}`);
    } catch (error: any) {
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
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl"><Home size={32} /></div>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa hộ khẩu</h1>
            <p className="text-blue-100 opacity-80">Cập nhật địa chỉ hoặc số sổ hộ khẩu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Số sổ hộ khẩu *</label>
              <input required name="soHoKhau" value={formData.soHoKhau} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none font-black rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số nhà *</label>
              <input required name="soNha" value={formData.soNha} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl font-black focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đường/Phố *</label>
              <input required name="duongPho" value={formData.duongPho} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none  font-black rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường *</label>
              <input required name="phuong" value={formData.phuong} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none font-black rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận *</label>
              <input required name="quan" value={formData.quan} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl font-black focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button disabled={submitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all">
            {submitting ? "Đang lưu..." : <><Save size={20} /> Lưu thay đổi</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditHouseholdPage;