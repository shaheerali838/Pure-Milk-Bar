import React from 'react';
import { Outlet } from 'react-router-dom';
import { Users } from 'lucide-react';
import StaffNav from '../components/StaffNav';

export default function StaffManagement() {
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
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
              Staff &amp; Workforce Management
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Employees, Attendance &amp; Payroll · {todayFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Active Staff
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub Nav shifted directly below the Page Title */}
      <StaffNav />

      {/* 3. Sub-page Content */}
      <Outlet />
    </div>
  );
}
