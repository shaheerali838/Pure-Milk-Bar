import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Droplets,
  Receipt,
  TrendingUp,
  FileText,
} from 'lucide-react';

export const SUPPLIER_TABS = [
  {
    id: 'dashboard',
    to: '/supplier',
    aliasTo: '/supplier/dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    color: '#1a2340', // Dark Navy
  },
  {
    id: 'directory',
    to: '/supplier/directory',
    label: 'Supplier Directory',
    icon: Users,
    color: '#009966', // Green
  },
  {
    id: 'intake',
    to: '/supplier/intake',
    label: 'Intake Register',
    icon: Droplets,
    color: '#155dfc', // Blue
  },
  {
    id: 'expenses',
    to: '/supplier/expenses',
    label: 'Source Expense',
    icon: Receipt,
    color: '#4f39f6', // Purple
  },
  {
    id: 'pl',
    to: '/supplier/pl',
    label: 'Supplier P&L',
    icon: TrendingUp,
    color: '#0092b8', // Teal/Cyan
  },
  {
    id: 'procurement',
    to: '/supplier/procurement',
    label: 'Procurement Sheet',
    icon: FileText,
    color: '#d97706', // Orange
  },
];

export default function SupplierNav() {
  const { pathname } = useLocation();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {SUPPLIER_TABS.map(({ to, label, icon: Icon, color }) => {
          const isActive =
            to === '/supplier'
              ? pathname === '/supplier' ||
                pathname === '/supplier/' ||
                pathname === '/supplier/dashboard'
              : pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className="flex items-center justify-center gap-2 px-4 h-[38px] sm:h-[40px] rounded-full whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer font-bold text-xs sm:text-[13px] text-white select-none hover:brightness-110 hover:-translate-y-px active:translate-y-0 shadow-xs"
              style={{
                backgroundColor: isActive ? color : `${color}dd`,
                boxShadow: isActive ? `0 4px 14px ${color}66` : 'none',
                border: isActive
                  ? '2px solid rgba(255, 255, 255, 0.45)'
                  : '2px solid transparent',
              }}
            >
              <Icon className="w-4 h-4 shrink-0 text-white" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
