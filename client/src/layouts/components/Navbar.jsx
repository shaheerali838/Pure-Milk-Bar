import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Milk, Search, Download, Truck, Bell } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const getNavInfo = (pathname) => {
    if (pathname.startsWith('/farm')) {
      return { operation: 'Farm Operation', page: 'Farm' };
    }
    if (pathname.startsWith('/supplier')) {
      return { operation: 'Supplier Operation', page: 'Supplier' };
    }
    return { operation: 'Dashboard Operation', page: 'Dashboard' };
  };

  const { operation, page } = getNavInfo(location.pathname);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Item,Category,Metric,Date\n1,Milk Collection,Dairy,3840L," + new Date().toLocaleDateString();
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${page.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="bg-white border-b border-slate-200/90 px-6 py-3 flex items-center justify-between gap-4 shadow-xs sticky top-0 z-10">
      {/* Left: Breadcrumb */}
      <div className="shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold tracking-wide bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 shadow-xs">
            <Milk className="w-3.5 h-3.5 text-emerald-600" />
            Pur Milk Bar
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#8da0b6] font-semibold tracking-wide text-xs">
            {operation}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
            {page}
          </span>
        </div>
      </div>

      

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Delivery Button */}
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          title="View Deliveries"
        >
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>Deliveries</span>
        </button>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Export CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
        <div className="flex-1 max-w-sm mx-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operations, farmers, cattle..."
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-full pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 mx-0.5"></div>

        {/* Admin Profile */}
       
        
      </div>
    </header>
  );
}

