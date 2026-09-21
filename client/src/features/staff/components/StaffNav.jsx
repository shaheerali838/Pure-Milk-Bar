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
    <div className="flex flex-col gap-1.5 pb-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
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
              className="flex items-center justify-center gap-2 px-3.5 h-[38px] rounded-full whitespace-nowrap transition-all duration-150 hover:brightness-110 hover:-translate-y-px active:translate-y-0 cursor-pointer select-none"
              style={{
                background: isActive ? color : `${color}dd`,
                boxShadow: isActive ? `0 4px 16px ${color}55` : 'none',
                border: isActive
                  ? '2px solid rgba(255, 255, 255, 0.45)'
                  : '2px solid transparent',
                transform: isActive ? 'translateY(-1px)' : 'none',
              }}
            >
              <Icon className="w-[14px] h-[14px] shrink-0 text-white" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-white leading-none">
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
