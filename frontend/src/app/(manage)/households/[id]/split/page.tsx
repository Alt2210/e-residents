"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Split, 
  Save, 
  UserMinus, 
  Home, 
  MapPin,
  Loader2 
} from "lucide-react";
import api from "@/src/lib/api";

const SplitHouseholdPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [oldHousehold, setOldHousehold] = useState<any>(null);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  
  // State lưu trữ dữ liệu theo đúng logic Backend yêu cầu
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    newSoHoKhau: "",
    newSoNha: "",
    newDuongPho: "",
    newPhuong: "",
    newQuan: "",
    newHeadPersonId: "" // ID của chủ hộ mới
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy thông tin hộ cũ và danh sách thành viên hiện tại
        const res = await api.get(`/households/${id}`);
        setOldHousehold(res.data.household);
        setAllMembers(res.data.persons || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        alert("Không thể tải thông tin hộ khẩu");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Xử lý chọn/bỏ chọn nhân khẩu muốn tách đi
  const toggleMember = (memberId: string) => {
    setSelectedPersonIds(prev => {
      const isSelected = prev.includes(memberId);
      if (isSelected) {
        // Nếu bỏ chọn người đang là chủ hộ mới thì reset field newHeadPersonId
        if (formData.newHeadPersonId === memberId) {
          setFormData(f => ({ ...f, newHeadPersonId: "" }));
        }
        return prev.filter(i => i !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra nghiệp vụ trước khi gửi
    if (selectedPersonIds.length === 0) {
      return alert("Vui lòng chọn ít nhất một thành viên để tách hộ!");
    }
    if (!formData.newHeadPersonId) {
      return alert("Vui lòng chỉ định một người trong danh sách tách làm chủ hộ mới!");
    }

    setSubmitting(true);
    try {
      // Body gửi lên khớp hoàn toàn với SplitHouseholdDto
      const submitBody = {
        ...formData,
        selectedPersonIds: selectedPersonIds
      };

      await api.post(`/households/${id}/split`, submitBody);
      
      alert("Tách hộ khẩu thành công!");
      router.push(`/households/${id}`);
    } catch (error: any) {
      console.error("Lỗi Validation Backend:", error.response?.data);
      const messages = error.response?.data?.message;
      alert("Lỗi: " + (Array.isArray(messages) ? messages.join(", ") : messages || "Không thể thực hiện tách hộ"));
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
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium">
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-600 rounded-2xl text-white shadow-lg shadow-orange-100">
          <Split size={24} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tách hộ khẩu</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CỘT TRÁI: DANH SÁCH NHÂN KHẨU */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 italic">
              <UserMinus size={18} className="text-orange-600" />
              Bước 1: Chọn người chuyển đi
            </h3>
          </div>
          <div className="p-6 space-y-3 overflow-y-auto max-h-[500px]">
            {allMembers.map((member) => (
              <div 
                key={member._id}
                onClick={() => toggleMember(member._id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedPersonIds.includes(member._id) 
                  ? "border-orange-500 bg-orange-50/50" 
                  : "border-gray-50 hover:border-gray-200 bg-gray-50/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    selectedPersonIds.includes(member._id) ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-400"
                  }`}>
                    {member.hoTen?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{member.hoTen}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">{member.quanHeVoiChuHo}</p>
                  </div>
                </div>
                
                {/* Chỉ hiện chọn chủ hộ mới nếu người này đã được chọn tách đi */}
                {selectedPersonIds.includes(member._id) && (
                  <div 
                    className="flex items-center gap-2" 
                    onClick={(e) => e.stopPropagation()} // Ngăn việc bỏ chọn member khi nhấn radio
                  >
                    <input 
                      type="radio" 
                      id={`head-${member._id}`}
                      name="newHeadPersonId" 
                      checked={formData.newHeadPersonId === member._id}
                      onChange={() => setFormData(f => ({ ...f, newHeadPersonId: member._id }))}
                      className="w-4 h-4 accent-orange-600 cursor-pointer font-black"
                    />
                    <label htmlFor={`head-${member._id}`} className="text-[10px] font-black text-orange-600 cursor-pointer uppercase">Chủ hộ mới</label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN HỘ MỚI */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 italic">
                <Home size={18} className="text-blue-600" />
                Bước 2: Thông tin sổ mới
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số sổ hộ khẩu mới *</label>
                <input required name="newSoHoKhau" value={formData.newSoHoKhau} onChange={handleInputChange} placeholder="VD: HK-2025-..." className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 font-black focus:ring-orange-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số nhà *</label>
                  <input required name="newSoNha" value={formData.newSoNha} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 font-black focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đường/Phố *</label>
                  <input required name="newDuongPho" value={formData.newDuongPho} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border-none rounded-xl font-black focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phường *</label>
                  <input required name="newPhuong" value={formData.newPhuong} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border-none font-black rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Quận *</label>
                  <input required name="newQuan" value={formData.newQuan} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border-none font-black rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  disabled={submitting}
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Xác nhận tách hộ</>}
                </button>
              </div>
            </form>
          </div>

          <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 flex gap-4">
             <MapPin className="text-orange-600 shrink-0" size={24} />
             <div className="space-y-1">
                <p className="text-sm font-bold text-orange-900">Lưu ý nghiệp vụ</p>
                <p className="text-xs text-orange-800 leading-relaxed italic">
                  Các nhân khẩu được chọn sẽ tự động chuyển sang địa chỉ mới. Sổ hộ khẩu cũ vẫn giữ nguyên các thành viên còn lại.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitHouseholdPage;