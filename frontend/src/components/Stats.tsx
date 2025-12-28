import React from 'react';
import { Users } from 'lucide-react';

export const StatCard = ({ label, value, change, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color} text-white`}>
        <Users size={24} />
      </div>
      <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">{change}</span>
    </div>
    <p className="text-gray-500 text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

export const TableRow = ({ name, cccd, date, status }: any) => (
  <tr className="hover:bg-gray-50 transition">
    <td className="px-6 py-4 font-medium text-gray-800">{name}</td>
    <td className="px-6 py-4 text-gray-500">{cccd}</td>
    <td className="px-6 py-4 text-gray-500">{date}</td>
    <td className="px-6 py-4">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === 'Thường trú' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
      }`}>
        {status}
      </span>
    </td>
    <td className="px-6 py-4">
      <button className="text-blue-600 hover:underline text-sm font-medium">Chi tiết</button>
    </td>
  </tr>
);