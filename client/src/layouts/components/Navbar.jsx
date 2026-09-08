import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Milk } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const getActiveTab = (pathname) => {
    if (pathname.startsWith('/farm')) return 'Farm Dashboard';
    if (pathname.startsWith('/supplier')) return 'Supplier Dashboard';
    return 'Main Dashboard';
  };

  const activeTab = getActiveTab(location.pathname);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div>
        {/* Breadcrumb: Pur Milk Bar > OPERATION COMMAND > Page Name */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold tracking-wide bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 shadow-xs">
            <Milk className="w-3.5 h-3.5 text-emerald-600" />
            Pur Milk Bar
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#90a1b9] font-semibold tracking-wide text-xs">
            OPERATION COMMAND
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
            {activeTab}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shadow-emerald-200">
          PM
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-slate-800 leading-none">Admin</p>
          <p className="text-xs text-slate-400 mt-1">Manager</p>
        </div>
      </div>
    </header>
  );
}

