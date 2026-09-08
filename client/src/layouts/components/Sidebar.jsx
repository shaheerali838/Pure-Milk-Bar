import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Tractor, Truck, Milk } from 'lucide-react';

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
    },
    {
      id: 'Farm',
      name: 'Farm Dashboard',
      icon: Tractor,
      path: '/farm',
      iconBg: 'bg-[#eafaf1]',
      iconColor: 'text-[#10b981]',
      iconBorder: 'border border-[#c6f6d5]',
    },
    {
      id: 'Supplier',
      name: 'Supplier Dashboard',
      icon: Truck,
      path: '/supplier',
      iconBg: 'bg-[#eef4ff]',
      iconColor: 'text-[#2563eb]',
      iconBorder: 'border border-[#dbeafe]',
    },
  ];

  return (
    <div className="w-72 bg-white min-h-screen flex flex-col border-r border-slate-200/80 shadow-xs">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-200">
          <Milk className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">Pur Milk Bar</h1>
          <p className="text-xs text-slate-400 font-medium">Dairy & Farm Operations</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        {/* Section Heading */}
        <div className="px-3 mb-3 text-xs font-bold tracking-wider text-[#8da0b6] uppercase">
          OPERATIONS COMMAND
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.id}
                to={link.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1864f7] text-white shadow-md shadow-blue-500/25'
                      : 'text-[#2e3e50] hover:bg-slate-100/70 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#0f4ec4] text-white'
                          : `${link.iconBg} ${link.iconColor} ${link.iconBorder}`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

