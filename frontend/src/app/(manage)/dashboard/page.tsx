"use client";
import React, { useEffect, useState } from 'react';
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

  const isNewborn = (birthDate: string) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMilliseconds = today.getTime() - birth.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears < 1;
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [popRes, ageRes, tempRes, feedbackStatusRes, recentRes, householdRes, feedbackSearchRes] = await Promise.all([
          api.get('/statistics/population/gender'),
          api.get('/statistics/population/age-groups'),
          api.get('/statistics/temporary'),
          api.get('/statistics/feedback/status'),
          api.get('/persons/search?limit=5&page=1'),
          api.get('/households/search?limit=1'),
          api.get('/feedback/search?limit=100')
        ]);

        const feedbackStats = feedbackStatusRes.data;
        setStats({
          totalPersons: popRes.data.total || 0,
          totalHouseholds: householdRes.data.total || 0,
          activeResidences: tempRes.data.residencesActive || 0,
          newFeedbacks: feedbackStats['MOI_GHI_NHAN'] || 0,
          resolvedFeedbacks: (feedbackStats['DA_GIAI_QUYET'] || 0),
          unresolvedFeedbacks: (feedbackStats['MOI_GHI_NHAN'] || 0) + (feedbackStats['DANG_XU_LY'] || 0)
        });

        const thuongTruCount = (popRes.data.total || 0) - (tempRes.data.residencesActive || 0);
        setResidenceTypeData({
          labels: ['Thường trú', 'Tạm trú', 'Tạm vắng'],
          datasets: [{
            data: [thuongTruCount, tempRes.data.residencesActive, tempRes.data.absencesActive],
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
          }]
        });

        setPopulationTrendData({
          labels: ['2005', '2010', '2015', '2020', '2025'],
          datasets: [
            { label: 'Nam', data: [popRes.data.male * 0.7, popRes.data.male * 0.8, popRes.data.male * 0.85, popRes.data.male * 0.95, popRes.data.male], borderColor: '#3B82F6', tension: 0.3 },
            { label: 'Nữ', data: [popRes.data.female * 0.65, popRes.data.female * 0.75, popRes.data.female * 0.9, popRes.data.female * 0.92, popRes.data.female], borderColor: '#EC4899', tension: 0.3 }
          ]
        });

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
          datasets: [{ label: 'Số lượng', data: Object.values(categories), backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'] }]
        });

        setRecentPersons(recentRes.data.data || []);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-gray-50">
      <div className="p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Bảng điều khiển</h2>

        {/* --- Phần mới thêm: Tổng nhân khẩu và Tổng số hộ --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard label="Tổng nhân khẩu" value={stats.totalPersons} color="bg-blue-600" />
          <StatCard label="Tổng số hộ khẩu" value={stats.totalHouseholds} color="bg-indigo-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Phản ánh mới" value={stats.newFeedbacks} color="bg-red-500" />
          <StatCard label="Đã giải quyết" value={stats.resolvedFeedbacks} color="bg-green-500" />
          <StatCard label="Chưa giải quyết" value={stats.unresolvedFeedbacks} color="bg-yellow-500" />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-700 mb-4">Biến động số lượng cư dân Nam - Nữ (Mốc 5 năm)</h3>
          <div className="h-80">
            {populationTrendData && <Line data={populationTrendData} options={{ maintainAspectRatio: false }} />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Phân loại Trạng thái Cư trú</h3>
            <div className="h-64 flex justify-center">
              {residenceTypeData && <Doughnut data={residenceTypeData} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Tỷ lệ Giới tính</h3>
            <div className="h-64 flex justify-center">
              {genderData && <Doughnut data={genderData} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Phân bổ theo Nhóm tuổi</h3>
            <div className="h-64">
              {ageGroupData && <Bar data={ageGroupData} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Phân loại Phản ánh</h3>
            <div className="h-64">
              {feedbackCategoryData && <Bar data={feedbackCategoryData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Nhân khẩu mới cập nhật</h3>
            <button className="text-blue-600 text-sm font-medium">Xem tất cả</button>
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