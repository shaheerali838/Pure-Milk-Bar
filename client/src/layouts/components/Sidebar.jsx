import React from 'react';
import { NavLink } from 'react-router-dom';
import { Milk, Users, BookOpen, LayoutGrid, Tractor, Truck } from 'lucide-react';
import accountKhataLinks from '../../components/common/Accounts_& _Khata_ledge';
import { saleInformation } from '../../components/common/SaleAndProducation/saleInformation';
import financeLinks from '../../components/common/Finance_links';

export default function Sidebar() {
  const links = [
    {
      id: 'Dashboard',
      name: 'Main Dashboard',
      icon: LayoutGrid,
      path: '/dashboard',
      iconBg: 'bg-[#f0f4f9]',
      iconColor: 'text-[#486581]',
      iconBorder: 'border border-[#e2e8f0]',
      activeBg: 'bg-slate-900 text-white shadow-xs',
      activeBadgeBg: 'bg-slate-800 text-white',
    },
    {
      id: 'Farm',
      name: 'Farm Dashboard',
      icon: Tractor,
      path: '/farm',
      iconBg: 'bg-[#eafaf1]',
      iconColor: 'text-[#10b981]',
      iconBorder: 'border border-[#c6f6d5]',
      activeBg: 'bg-[#009966] text-white shadow-xs',
      activeBadgeBg: 'bg-[#007a52] text-white',
    },
    {
      id: 'Supplier',
      name: 'Supplier Dashboard',
      icon: Truck,
      path: '/supplier',
      iconBg: 'bg-[#eef4ff]',
      iconColor: 'text-[#2563eb]',
      iconBorder: 'border border-[#dbeafe]',
      activeBg: 'bg-[#1864f7] text-white shadow-xs',
      activeBadgeBg: 'bg-[#0f4ec4] text-white',
    },
  ];

  const getLinkIcon = (id) => {
    switch (id) {
      case 'customer':
        return Users;
      case 'customer khata ledger':
        return BookOpen;
      default:
        return Users;
    }
  };

  return (
    <aside className="w-64 bg-white min-h-screen flex flex-col border-r border-slate-200/80 shadow-xs shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#00a86b] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
          <Milk className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Pure Milk Bar</h1>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              ERP
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Dairy Operations Engine
          </p>
        </div>
      </div>

      {/* Main Navigation Container (Single unified scroll direction) */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        

        {/* Section 1: Operations Command */}
        <div>
          <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
            OPERATIONS COMMAND
          </div>
          <nav className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.id}
                  to={link.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${isActive
                      ? 'bg-[#00a86b] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Sales & Production */}
        <div>
          <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
            SALES &amp; PRODUCTION
          </div>
          <nav className="space-y-0.5">
            {saleInformation.map((sale) => {
              const Icon = sale.icon;
              return (
                <NavLink
                  key={sale.id}
                  to={sale.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${isActive
                      ? 'bg-[#00a86b] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{sale.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Section 3: Accounts & Khata Ledger */}
        <div>
          <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
            ACCOUNTS &amp; KHATA LEDGER
          </div>
          <nav className="space-y-0.5">
            {accountKhataLinks.map((link) => {
              const Icon = getLinkIcon(link.id);
              return (
                <NavLink
                  key={link.id}
                  to={link.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${isActive
                      ? 'bg-[#00a86b] text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Section 4: Finance */}
        <div>
          <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
            FINANCE
          </div>
          <nav className="space-y-0.5">
            {financeLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.id}
                  to={link.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${isActive
                      ? 'bg-[#00a86b] text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
