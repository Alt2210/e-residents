"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Loader2, CheckCircle } from "lucide-react";
import api from "@/src/lib/api";
import Modal from "@/src/components/Modal"; // Đảm bảo đường dẫn đúng

// 1. Định nghĩa cấu trúc dữ liệu cho Form
interface CitizenRegistration {
  hoTen: string;
  biDanh?: string;
  ngaySinh: string;
  gioiTinh: string;
  noiSinh: string;
  nguyenQuan: string;
  danToc: string;
  tonGiao: string;
  quocTich: string;
  soCCCD?: string;
  ngayCapCCCD?: string | null;
  noiCapCCCD?: string;
  ngheNghiep?: string;
  noiLamViec?: string;
  householdId: string;
  quanHeVoiChuHo: string;
  ngayDangKyThuongTru: string;
  diaChiThuongTruTruoc?: string;
}

const RegistNewCitizenPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State cho Modal

  // 2. Khởi tạo State với Interface
  const [formData, setFormData] = useState<CitizenRegistration>({
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
    ngayDangKyThuongTru: new Date().toISOString().split("T")[0],
    diaChiThuongTruTruoc: "",
  });

  // 3. Xử lý thay đổi Input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Xử lý gửi Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const submitData: any = { ...formData };

    // Xóa các trường rỗng không bắt buộc
    if (!submitData.ngayCapCCCD) delete submitData.ngayCapCCCD;
    if (!submitData.soCCCD) delete submitData.soCCCD;
    if (!submitData.biDanh) delete submitData.biDanh;
    if (!submitData.noiCapCCCD) delete submitData.noiCapCCCD;
    if (!submitData.ngheNghiep) delete submitData.ngheNghiep;

    try {
      await api.post("/persons", submitData);
      // Hiển thị Modal thay vì alert
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error.response?.data);
      const serverMessage = error.response?.data?.message;
      alert(
        "Lỗi: " +
          (Array.isArray(serverMessage)
            ? serverMessage.join(", ")
            : serverMessage || "Không thể đăng ký")
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đóng modal và chuyển trang
  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.push("/citizens");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-google-sans">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-50 border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Phiếu Khai Nhân Khẩu</h1>
              <p className="text-blue-100 opacity-80">
                Nhập thông tin chi tiết để thêm nhân khẩu vào hệ thống
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Cột 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              Thông tin cơ bản
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <input
                required
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh *
                </label>
                <input
                  required
                  type="date"
                  name="ngaySinh"
                  value={formData.ngaySinh}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính *
                </label>
                <select
                  name="gioiTinh"
                  value={formData.gioiTinh}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số CCCD
              </label>
              <input
                name="soCCCD"
                value={formData.soCCCD}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="12 số"
              />
            </div>
          </div>

          {/* Cột 2: Cư trú & Hộ khẩu */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              Cư trú & Hộ khẩu
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số hộ khẩu *
              </label>
              <input
                required
                name="householdId"
                value={formData.householdId}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: HK001"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">
                * Nhập chính xác số sổ hộ khẩu đã lập trên hệ thống
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quan hệ với chủ hộ *
              </label>
              <input
                required
                name="quanHeVoiChuHo"
                value={formData.quanHeVoiChuHo}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Vợ, con, cháu..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nghề nghiệp
              </label>
              <input
                name="ngheNghiep"
                value={formData.ngheNghiep}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dân tộc
              </label>
              <input
                name="danToc"
                value={formData.danToc}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Đang xử lý...
                </>
              ) : (
                <>
                  <Save size={20} /> Lưu hồ sơ nhân khẩu
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- MODAL THÀNH CÔNG --- */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccess}
        title="Đăng ký thành công"
        maxWidth="max-w-sm"
        footer={
          <button
            onClick={handleCloseSuccess}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
          >
            Về danh sách nhân khẩu
          </button>
        }
      >
        <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle size={48} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-800">Đã thêm nhân khẩu!</h4>
            <p className="text-gray-500 mt-2">
              Nhân khẩu <span className="font-bold text-blue-600">{formData.hoTen}</span> đã được thêm vào hệ thống thành công.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RegistNewCitizenPage;