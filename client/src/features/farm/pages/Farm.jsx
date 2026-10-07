import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Droplets, Plus } from 'lucide-react';
import FarmNav from '../components/FarmNav';

export default function Farm() {
  const navigate = useNavigate();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-10 space-y-3">
      {/* 1. Page Title at the Top */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
              Farm Operations &amp; Livestock
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                In-House Dairy &amp; Herd Management · {todayFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Active Hub
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/farm/milking')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Milking Register</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/farm/animals')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-3" />
            <span>Register Animal</span>
          </button>
        </div>
      </div>

      {/* 2. Sub Nav shifted directly below the Page Title */}
      <FarmNav />

      {/* 3. Sub-page Content */}
      <Outlet />
    </div>
  );
}
