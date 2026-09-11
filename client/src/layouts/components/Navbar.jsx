import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Milk, Search, Download, Truck, Bell, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const getNavInfo = (pathname) => {
    if (pathname.startsWith('/farm')) {
      if (pathname.includes('/animals')) return { operation: 'Farm Operation', page: 'Animals & Herd' };
      if (pathname.includes('/milking')) return { operation: 'Farm Operation', page: 'Milking Register' };
      if (pathname.includes('/processing')) return { operation: 'Farm Operation', page: 'Dahi & Processing' };
      if (pathname.includes('/expenses')) return { operation: 'Farm Operation', page: 'Farm Expenses' };
      if (pathname.includes('/pl')) return { operation: 'Farm Operation', page: 'Farm P&L' };
      if (pathname.includes('/dailysheet')) return { operation: 'Farm Operation', page: 'Daily Sheet' };
      return { operation: 'Farm Operation', page: 'Dashboard' };
    }
    if (pathname.startsWith('/supplier')) {
      return { operation: 'Supplier Sourcing', page: 'Supplier' };
    }
    if (pathname.startsWith('/proccessing')) {
      return { operation: 'Dahi Processing', page: 'Processing' };
    }
    if (pathname.startsWith('/pos')) {
      return { operation: 'Counting POS', page: 'POS' };
    }
    if (pathname.startsWith('/delivery')) {
      return { operation: 'DoorStep Delivery', page: 'Deliveries' };
    }
    if (pathname.startsWith('/customer-khata-ledger')) {
      return { operation: 'Khata', page: 'Khata Ledger' };
    }
    if (pathname.startsWith('/customer')) {
      return { operation: 'Customer Management', page: 'Customers' };
    }
    if (pathname.startsWith('/collection-payment')) {
      return { operation: 'Collection Payment', page: 'Collections' };
    }
    if (pathname.startsWith('/receivables')) {
      return { operation: 'Receivables Aging', page: 'Receivables' };
    }
    if (pathname.startsWith('/products')) {
      return { operation: 'Catalog', page: 'Products' };
    }
    return { operation: 'Dashboard', page: 'Overview' };
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
    <header className="bg-white border-b border-slate-200/80 px-4 py-2 flex items-center justify-between gap-3 shadow-2xs sticky top-0 z-20">
      <div className="shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            <Milk className="w-3.5 h-3.5 text-emerald-600" />
            Pur Milk Bar
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-500 font-medium">
            {operation}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-emerald-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
            {page}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="Export CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
          title="View Deliveries"
        >
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>Deliveries</span>
        </button>

        <div className="w-48 sm:w-56">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg pl-7 pr-2.5 py-1 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-100 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>  

        <button
          type="button"
          className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>

        {/* User Profile Badge */}
        
      </div>
    </header>
  );
}
