"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Home, 
  Heart,
  ShieldCheck,
  Clock
} from "lucide-react";
import api from "@/src/lib/api";

const CitizenDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [citizen, setCitizen] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/persons/${id}`);
        setCitizen(response.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  // --- HÀM HỖ TRỢ KIỂM TRA ĐỘ TUỔI ---
  const isNewborn = (birthDate: string) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMilliseconds = today.getTime() - birth.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears < 1;
  };

  // 1. Hàm chuyển đổi mã trạng thái sang tiếng Việt (Cập nhật Mới sinh)
  const formatStatusText = (status: string, birthDate: string) => {
    if (isNewborn(birthDate)) return "Mới sinh";

    switch (status) {
      case 'THUONG_TRU': return "Thường trú";
      case 'TAM_TRU': return "Tạm trú";
      case 'TAM_VANG': return "Tạm vắng";
      case 'DA_QUA_DOI': return "Đã qua đời";
      case 'DA_CHUYEN_DI': return "Đã chuyển đi";
      default: return status;
    }
  };

  // 2. Hàm lấy màu sắc cho Badge trạng thái (Cập nhật màu Hồng cho Mới sinh)
  const getStatusStyle = (status: string, birthDate: string) => {
    if (isNewborn(birthDate)) return "bg-pink-100 text-pink-700";

    switch (status) {
      case 'THUONG_TRU': return "bg-green-100 text-green-700";
      case 'TAM_VANG': return "bg-yellow-100 text-yellow-700";
      case 'TAM_TRU': return "bg-blue-100 text-blue-700";
      case 'DA_QUA_DOI': return "bg-gray-100 text-gray-700";
      case 'DA_CHUYEN_DI': return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) return (
    <div className="p-20 text-center font-google-sans text-gray-500">Đang tải hồ sơ...</div>
  );

  if (!citizen) return (
    <div className="p-20 text-center font-google-sans text-red-500">Không tìm thấy hồ sơ nhân khẩu.</div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto font-google-sans space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
      >
        <ArrowLeft size={20} /> Quay lại danh sách
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-50 border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center text-4xl font-bold backdrop-blur-sm border border-white/30">
              {citizen.hoTen?.charAt(0) || "?"}
            </div>
            <div>
              <h1 className="text-3xl tracking-tight font-bold">{citizen.hoTen}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {/* HIỂN THỊ TRẠNG THÁI CÓ MÀU VÀ CÓ DẤU (ĐÃ CẬP NHẬT LOGIC MỚI SINH) */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyle(citizen.trangThai, citizen.ngaySinh)}`}>
                  {formatStatusText(citizen.trangThai, citizen.ngaySinh)}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                  {citizen.quanHeVoiChuHo}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm font-medium">Mã định danh hệ thống</p>
            <code className="text-xs bg-black/10 px-2 py-1 rounded font-mono">{citizen._id}</code>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-blue-600 font-bold border-b pb-2">
              <ShieldCheck size={20} /> <h3>Định danh & Cá nhân</h3>
            </div>
            <InfoItem label="Số CCCD" value={citizen.soCCCD || "Chưa cấp"} icon={<CreditCard size={16}/>} />
            <InfoItem label="Biệt danh" value={citizen.biDanh || "Không có"} icon={<User size={16}/>} />
            <InfoItem label="Ngày sinh" value={new Date(citizen.ngaySinh).toLocaleDateString('vi-VN')} icon={<Calendar size={16}/>} />
            <InfoItem label="Giới tính" value={citizen.gioiTinh} />
            <InfoItem label="Dân tộc" value={citizen.danToc} />
            <InfoItem label="Tôn giáo" value={citizen.tonGiao} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 text-blue-600 font-bold border-b pb-2">
              <Home size={20} /> <h3>Hộ khẩu & Cư trú</h3>
            </div>
            <InfoItem 
              label="Số sổ hộ khẩu" 
              value={citizen.householdId?.soHoKhau || "N/A"} 
              className="text-blue-700 font-bold"
              icon={<Home size={16}/>} 
            />
            <InfoItem 
              label="Địa chỉ hiện tại" 
              value={`${citizen.householdId?.soNha || ''}, ${citizen.householdId?.duongPho || ''}, P. ${citizen.householdId?.phuong || ''}, Q. ${citizen.householdId?.quan || ''}`} 
              icon={<MapPin size={16}/>}
            />
            <InfoItem label="Ngày ĐK thường trú" value={citizen.ngayDangKyThuongTru ? new Date(citizen.ngayDangKyThuongTru).toLocaleDateString('vi-VN') : "N/A"} icon={<Clock size={16}/>} />
            <InfoItem label="Địa chỉ trước đây" value={citizen.diaChiThuongTruTruoc || "N/A"} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 text-blue-600 font-bold border-b pb-2">
              <Briefcase size={20} /> <h3>Nghề nghiệp & Gốc gác</h3>
            </div>
            <InfoItem label="Nghề nghiệp" value={citizen.ngheNghiep || "Không có"} icon={<Briefcase size={16}/>} />
            <InfoItem label="Nơi làm việc" value={citizen.noiLamViec || "N/A"} />
            <InfoItem label="Nơi sinh" value={citizen.noiSinh || "N/A"} />
            <InfoItem label="Nguyên quán" value={citizen.nguyenQuan || "N/A"} />
            <InfoItem label="Quốc tịch" value={citizen.quocTich || "Việt Nam"} />
          </div>
        </div>

        {(citizen.ngayChuyenDi || citizen.ngayQuaDoi) && (
          <div className="p-8 bg-gray-50 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            {citizen.ngayChuyenDi && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <p className="text-red-600 font-bold flex items-center gap-2"><MapPin size={16}/> Đã chuyển đi</p>
                <p className="text-sm text-red-700 mt-1">Ngày: {new Date(citizen.ngayChuyenDi).toLocaleDateString('vi-VN')}</p>
                <p className="text-sm text-red-700 italic">Đến: {citizen.noiChuyenDen}</p>
              </div>
            )}
            {citizen.ngayQuaDoi && (
              <div className="bg-gray-200 p-4 rounded-2xl border border-gray-300">
                <p className="text-gray-700 font-bold flex items-center gap-2"><Heart size={16}/> Nhân khẩu đã mất</p>
                <p className="text-sm text-gray-800 mt-1">Ngày qua đời: {new Date(citizen.ngayQuaDoi).toLocaleDateString('vi-VN')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, icon, className = "" }: { label: string, value: string, icon?: React.ReactNode, className?: string }) => (
  <div className="space-y-1">
    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
    <div className={`flex items-center gap-2 text-gray-800 ${className}`}>
      {icon && <span className="text-gray-300">{icon}</span>}
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

export default CitizenDetailPage;