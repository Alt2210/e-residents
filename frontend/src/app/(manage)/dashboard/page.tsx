"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { StatCard } from '@/src/components/Stats';
import api from '@/src/lib/api'; 
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

export default function DashboardPage() {
  // 1. State cho bộ lọc thời gian
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [stats, setStats] = useState({
    totalPersons: 0,
    totalHouseholds: 0,
    activeResidences: 0,
    newFeedbacks: 0,
    resolvedFeedbacks: 0,
    unresolvedFeedbacks: 0
  });

  const [genderData, setGenderData] = useState<any>(null);
  const [ageGroupData, setAgeGroupData] = useState<any>(null);
  const [residenceTypeData, setResidenceTypeData] = useState<any>(null);
  const [feedbackCategoryData, setFeedbackCategoryData] = useState<any>(null);
  const [populationTrendData, setPopulationTrendData] = useState<any>(null);

  const [recentPersons, setRecentPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Hàm tính khoảng thời gian theo Quý
  const getQuarterRange = useCallback((quarter: number, year: number) => {
    const startMonth = (quarter - 1) * 3;
    const fromDate = new Date(year, startMonth, 1).toISOString();
    const toDate = new Date(year, startMonth + 3, 0, 23, 59, 59).toISOString();
    return { fromDate, toDate };
  }, []);

  const isNewborn = (birthDate: string) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMilliseconds = today.getTime() - birth.getTime();
    return ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25) < 1;
  };

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { fromDate, toDate } = getQuarterRange(selectedQuarter, selectedYear);

      // Gọi API với bộ lọc ngày cho phần Phản ánh
      const [popRes, ageRes, tempRes, feedbackStatusRes, recentRes, householdRes, feedbackSearchRes] = await Promise.all([
        api.get('/statistics/population/gender'),
        api.get('/statistics/population/age-groups'),
        api.get('/statistics/temporary'),
        api.get(`/statistics/feedback/status?fromDate=${fromDate}&toDate=${toDate}`),
        api.get('/persons/search?limit=5&page=1'),
        api.get('/households/search?limit=1'),
        api.get(`/feedback/search?limit=100&fromDate=${fromDate}&toDate=${toDate}`)
      ]);

      const feedbackStats = feedbackStatusRes.data;
      setStats({
        totalPersons: popRes.data.total || 0,
        totalHouseholds: householdRes.data.total || 0,
        activeResidences: tempRes.data.residencesActive || 0,
        newFeedbacks: feedbackStats['MOI_GHI_NHAN'] || 0,
        resolvedFeedbacks: feedbackStats['DA_GIAI_QUYET'] || 0,
        unresolvedFeedbacks: (feedbackStats['MOI_GHI_NHAN'] || 0) + (feedbackStats['DANG_XU_LY'] || 0)
      });

      // Cập nhật biểu đồ
      setGenderData({
        labels: ['Nam', 'Nữ', 'Khác'],
        datasets: [{ data: [popRes.data.male, popRes.data.female, popRes.data.other], backgroundColor: ['#3B82F6', '#EC4899', '#94A3B8'] }]
      });

      setAgeGroupData({
        labels: ['Mầm non', 'Mẫu giáo', 'Cấp 1', 'Cấp 2', 'Cấp 3', 'Lao động', 'Nghỉ hưu'],
        datasets: [{ label: 'Số lượng', data: Object.values(ageRes.data), backgroundColor: 'rgba(59, 130, 246, 0.6)' }]
      });

      const categories: Record<string, number> = {};
      (feedbackSearchRes.data.data || []).forEach((f: any) => {
        const cat = f.phanLoai || 'Khác';
        categories[cat] = (categories[cat] || 0) + 1;
      });

      setFeedbackCategoryData({
        labels: Object.keys(categories),
        datasets: [{ 
          label: `Số lượng kiến nghị Q${selectedQuarter}/${selectedYear}`, 
          data: Object.values(categories), 
          backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'] 
        }]
      });

      setRecentPersons(recentRes.data.data || []);
      // ... (Các logic setResidenceTypeData và populationTrendData giữ nguyên)
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedQuarter, selectedYear]);

  return (
    <main className="flex-1 flex flex-col bg-gray-50">
      <div className="p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h2>
          
          {/* Bộ lọc Quý/Năm */}
          <div className="flex gap-4 items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Xem theo:</span>
              <select 
                className="bg-gray-50 border-none text-blue-600 font-bold text-sm focus:ring-0 cursor-pointer"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              >
                <option value={1}>Quý 1</option>
                <option value={2}>Quý 2</option>
                <option value={3}>Quý 3</option>
                <option value={4}>Quý 4</option>
              </select>
            </div>
            <select 
              className="bg-gray-50 border-none text-blue-600 font-bold text-sm focus:ring-0 cursor-pointer border-l pl-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2024, 2025].map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard label="Tổng nhân khẩu" value={stats.totalPersons} color="bg-blue-600" />
          <StatCard label="Tổng số hộ khẩu" value={stats.totalHouseholds} color="bg-indigo-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label={`Phản ánh mới Q${selectedQuarter}`} value={stats.newFeedbacks} color="bg-red-500" />
          <StatCard label={`Đã giải quyết Q${selectedQuarter}`} value={stats.resolvedFeedbacks} color="bg-green-500" />
          <StatCard label={`Đang chờ Q${selectedQuarter}`} value={stats.unresolvedFeedbacks} color="bg-yellow-500" />
        </div>

        {/* --- Phần Biểu đồ --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Phân loại Phản ánh (Dữ liệu Quý)</h3>
            <div className="h-64">
              {feedbackCategoryData && <Bar data={feedbackCategoryData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Tỷ lệ Giới tính</h3>
            <div className="h-64 flex justify-center">
              {genderData && <Doughnut data={genderData} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
        </div>

        {/* --- Bảng Nhân khẩu --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Nhân khẩu mới cập nhật</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Họ và Tên</th>
                  <th className="px-6 py-4">Số CCCD</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPersons.map((person: any) => (
                  <tr key={person._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{person.hoTen}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono">{person.soCCCD || "Chưa có"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(person.trangThai, person.ngaySinh)}`}>
                        {formatStatusText(person.trangThai, person.ngaySinh)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}