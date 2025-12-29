"use client";
import React, { useEffect, useState } from 'react';
import { StatCard, TableRow } from '@/src/components/Stats';
import api from '@/src/lib/api'; 

export default function DashboardPage() {
  // 1. Khởi tạo state khớp với cấu trúc trả về của StatisticsService
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalHouseholds: 0,
    activeResidences: 0,
    newFeedbacks: 0
  });
  const [recentPersons, setRecentPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Gọi song song các API thống kê từ StatisticsController
        const [popRes, tempRes, feedbackRes, recentRes] = await Promise.all([
          api.get('/statistics/population/gender'),       //
          api.get('/statistics/temporary'),               //
          api.get('/statistics/feedback/status'),          //
          api.get('/persons/search?limit=5&page=1')        // Lấy danh sách mới nhất
        ]);

        setStats({
          totalPersons: popRes.data.total || 0,           //
          totalHouseholds: recentRes.data.total || 0,     // Tạm lấy từ tổng số nhân khẩu/hộ
          activeResidences: tempRes.data.residencesActive || 0, //
          newFeedbacks: feedbackRes.data.MOI_GHI_NHAN || 0      //
        });

        setRecentPersons(recentRes.data.data || []);      //
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <main className="flex-1 flex flex-col">
      <div className="p-8 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h2>
          <p className="text-gray-500">
            {loading ? "Đang tải dữ liệu..." : "Hệ thống đang hoạt động ổn định."}
          </p>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            label="Tổng nhân khẩu" 
            value={stats.totalPersons.toLocaleString()} 
            change="" 
            color="bg-blue-500" 
          />
          <StatCard 
            label="Tổng số hộ" 
            value={stats.totalHouseholds.toLocaleString()} 
            change="" 
            color="bg-purple-500" 
          />
          <StatCard 
            label="Tạm trú hiệu lực" 
            value={stats.activeResidences.toLocaleString()} 
            change="" 
            color="bg-orange-500" 
          />
          <StatCard 
            label="Kiến nghị mới" 
            value={stats.newFeedbacks.toLocaleString()} 
            change="" 
            color="bg-red-500" 
          />
        </div>

        {/* Danh sách nhân khẩu mới nhất từ API */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">Nhân khẩu mới cập nhật</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Họ và Tên</th>
                  <th className="px-6 py-4">Số CCCD</th>
                  <th className="px-6 py-4">Ngày đăng ký</th>
                  <th className="px-6 py-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPersons.map((person: any) => (
                  <TableRow 
                    key={person._id}
                    name={person.hoTen} 
                    cccd={person.soCCCD || "Chưa có"} 
                    date={new Date(person.ngayDangKyThuongTru).toLocaleDateString('vi-VN')} 
                    status={person.trangThai} 
                  />
                ))}
                {!loading && recentPersons.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Chưa có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}