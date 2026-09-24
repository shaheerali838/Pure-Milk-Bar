import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileSpreadsheet,
} from 'lucide-react';

export const STAFF_NAV_TABS = [
  {
    id: 'dashboard',
    to: '/staff',
    aliasTo: '/staff/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: '#1a2340', // Dark Navy
  },
  {
    id: 'manage',
    to: '/staff/manage',
    aliasTo: '/staff/add',
    label: 'Add / Manage Staff',
    icon: Users,
    color: '#009966', // Green
  },
  {
    id: 'attendance',
    to: '/staff/attendance',
    label: 'Attendance',
    icon: CheckSquare,
    color: '#155dfc', // Blue
  },
  {
    id: 'dailysheet',
    to: '/staff/dailysheet',
    aliasTo: '/staff/daily-sheet',
    label: 'Daily Sheet',
    icon: FileSpreadsheet,
    color: '#d97706', // Orange
  },
];

export default function StaffNav() {
  const { pathname } = useLocation();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {STAFF_NAV_TABS.map(({ id, to, aliasTo, label, icon: Icon, color }) => {
          let isActive = false;

          if (id === 'dashboard') {
            isActive =
              pathname === '/staff' ||
              pathname === '/staff/' ||
              pathname === '/staff/dashboard' ||
              pathname === '/finance/staff' ||
              pathname === '/finance/staff/';
          } else if (id === 'manage') {
            isActive =
              pathname.startsWith('/staff/manage') ||
              pathname.startsWith('/staff/add') ||
              pathname.startsWith('/finance/staff/manage');
          } else if (id === 'attendance') {
            isActive =
              pathname.startsWith('/staff/attendance') ||
              pathname.startsWith('/finance/staff/attendance');
          } else if (id === 'dailysheet') {
            isActive =
              pathname.startsWith('/staff/dailysheet') ||
              pathname.startsWith('/staff/daily-sheet') ||
              pathname.startsWith('/finance/staff/dailysheet') ||
              pathname.startsWith('/finance/staff/daily-sheet');
          }

          return (
            <NavLink
              key={id}
              to={to}
              className="flex items-center justify-center gap-2 px-4 h-[38px] sm:h-[40px] rounded-full whitespace-nowrap shrink-0 transition-all duration-150 hover:brightness-110 hover:-translate-y-px active:translate-y-0 cursor-pointer select-none shadow-xs"
              style={{
                background: isActive ? color : `${color}dd`,
                boxShadow: isActive ? `0 4px 14px ${color}66` : 'none',
                border: isActive
                  ? '2px solid rgba(255, 255, 255, 0.45)'
                  : '2px solid transparent',
              }}
            >
              <Icon className="w-4 h-4 shrink-0 text-white" />
              <span className="text-xs sm:text-[13px] font-bold text-white leading-none tracking-tight">
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
