import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trees, Users, Milk } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { id: 'Dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'Farm', name: 'Farm', icon: Trees, path: '/farm' },
    { id: 'Supplier', name: 'Supplier', icon: Users, path: '/supplier' },
  ];

  return (
    <div className="w-64 bg-white min-h-screen flex flex-col border-r border-slate-200">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-200">
          <Milk className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">Pur Milk Bar</h1>
          <p className="text-xs text-slate-400 font-medium">Dairy & Farm Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.id}
              to={link.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{link.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
