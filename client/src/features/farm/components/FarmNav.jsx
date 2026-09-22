import React from 'react';
import {
  LayoutDashboard,
  Beef,
  Droplets,
  Layers,
  Receipt,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/farm',            label: 'Dashboard',        icon: LayoutDashboard, color: '#1a2340' },
  { to: '/farm/animals',    label: 'Animals & Herd',    icon: Beef,            color: '#009966' },
  { to: '/farm/milking',    label: 'Milking Register',  icon: Droplets,        color: '#155dfc' },
  { to: '/farm/processing', label: 'Dahi & Processing', icon: Layers,          color: '#009689' },
  { to: '/farm/expenses',   label: 'Farm Expenses',     icon: Receipt,         color: '#4f39f6' },
  { to: '/farm/pl',         label: 'Farm P&L',          icon: TrendingUp,      color: '#0092b8' },
  { to: '/farm/dailysheet', label: 'Daily Sheet',       icon: FileText,        color: '#d97706' },
];

export default function FarmNav() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
        {tabs.map(({ to, label, icon: Icon, color }) => {
          const isActive = to === '/farm' ? (pathname === '/farm' || pathname === '/farm/') : pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex items-center justify-center gap-1.5 px-4 h-[42px] rounded-full whitespace-nowrap transition-all duration-150 hover:brightness-110 hover:-translate-y-px active:translate-y-0 cursor-pointer"
              style={{
                background: isActive ? color : `${color}dd`,
                boxShadow: isActive ? `0 4px 16px ${color}55` : 'none',
                border: isActive ? '2px solid rgba(255,255,255,0.28)' : '2px solid transparent',
              }}
            >
              <Icon className="w-[14px] h-[14px] shrink-0 text-white" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-white leading-none">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
