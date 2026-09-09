import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Tractor, Truck, Milk } from 'lucide-react';
import { saleInformation } from '../../components/common/SaleAndProducation/saleInformation';

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

  return (
    <aside className="w-64 bg-white min-h-screen flex flex-col border-r border-slate-200/80 shadow-xs shrink-0">
      {/* Brand Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
          <Milk className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 leading-tight">
            Pur Milk Bar
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            Dairy & Farm Management
          </p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Operations Section */}
        <div>
          <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            OPERATIONS COMMAND
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.id} 
                  to={link.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? link.activeBg
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? link.activeBadgeBg
                            : `${link.iconBg} ${link.iconColor} ${link.iconBorder}`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{link.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sales & Production Section */}
        <div>
          <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            SALES & PRODUCTION
          </div>

          <nav className="space-y-1">
            {saleInformation.map((sale) => {
              const Icon = sale.icon;
              return (
                <NavLink
                  key={sale.id} 
                  to={sale.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? sale.activeBg
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? sale.activeBadgeBg
                            : `${sale.iconBg} ${sale.iconColor} ${sale.iconBorder}`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{sale.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
