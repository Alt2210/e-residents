"use client";
import React from 'react';
import { Sidebar } from '@/src/components/SideBar';
import { Header } from '@/src/components/Header';
import { StatCard, TableRow } from '@/src/components/Stats';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <Header />

        <div className="p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h2>
            <p className="text-gray-500">Hệ thống đang hoạt động ổn định.</p>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Tổng nhân khẩu" value="1,284" change="+12" color="bg-blue-500" />
            <StatCard label="Số hộ khẩu" value="312" change="+3" color="bg-purple-500" />
            <StatCard label="Tạm trú mới" value="45" change="+8" color="bg-orange-500" />
            <StatCard label="Phản ánh" value="12" change="0" color="bg-red-500" />
          </div>

          {/* Recent List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h3 className="font-bold text-gray-800">Danh sách mới nhất</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Họ và Tên</th>
                  <th className="px-6 py-4">Số CCCD</th>
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <TableRow name="Nguyễn Văn A" cccd="031092001234" date="12/12/2023" status="Thường trú" />
                <TableRow name="Trần Thị B" cccd="031092005678" date="15/12/2023" status="Tạm trú" />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}