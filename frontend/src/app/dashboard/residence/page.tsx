"use client";

import React, { useState } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const ResidencePage = () => {
  const [tab, setTab] = useState('tam-tru');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Biến động cư trú</h2>
        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 flex gap-1 shadow-sm">
          <button 
            onClick={() => setTab('tam-tru')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'tam-tru' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Tạm trú
          </button>
          <button 
            onClick={() => setTab('tam-vang')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'tam-vang' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Tạm vắng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-wrap md:flex-nowrap items-center gap-6 shadow-sm group">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${tab === 'tam-tru' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
              <FileText size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-lg font-bold text-gray-900 truncate">Trần Văn C</h4>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-tighter">037090004455</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Lý do: Đi học đại học tại TP. Hồ Chí Minh</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1"><Calendar size={14}/> Từ: 01/09/2023</span>
                <span className="flex items-center gap-1"><Clock size={14}/> Đến: 01/09/2024</span>
              </div>
            </div>
            <div className="flex items-center gap-4 pr-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Trạng thái</p>
                <span className="flex items-center justify-end gap-1.5 text-green-600 font-bold text-sm italic">
                  <CheckCircle2 size={16} /> Đang hiệu lực
                </span>
              </div>
              <button className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl transition-all">
                <AlertCircle size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResidencePage;