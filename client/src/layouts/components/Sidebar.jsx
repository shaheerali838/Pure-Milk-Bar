import React from 'react';
import { NavLink } from 'react-router-dom';
import { Milk, Users, BookOpen, CreditCard, Clock, LayoutGrid, Tractor, Truck } from 'lucide-react';
import accountKhataLinks from '../../components/common/Accounts_& _Khata_ledge';

export default function Sidebar() {
  const operationsLinks = [
    { id: 'Dashboard', name: 'Main Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 'Farm', name: 'Farm Dashboard', icon: Tractor, path: '/farm' },
    { id: 'Supplier', name: 'Supplier Dashboard', icon: Truck, path: '/supplier' },
  ];

  const getLinkIcon = (id) => {
    switch (id) {
      case 'customer':
        return Users;
      case 'customer khata ledger':
        return BookOpen;
      case 'collection & payout ':
        return CreditCard;
      case 'Receivables aging':
        return Clock;
      default:
        return Users;
    }
  };

  return (
    <div className="w-64 bg-white min-h-screen flex flex-col border-r border-slate-200/80 shadow-xs shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#00a86b] text-white flex items-center justify-center font-bold shadow-xs">
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
     {/* Operations Command */}
        <div>
          <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
            OPERATIONS COMMAND
          </div>
          <nav className="space-y-0.5">
            {operationsLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.id}
                  to={link.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                      isActive
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
      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Accounts & Khata Ledger (First) */}
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
                    `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                      isActive
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
    </div>
  );
}
