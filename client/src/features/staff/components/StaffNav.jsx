import React from 'react';
import { LayoutDashboard, Users, CheckSquare, FileSpreadsheet, Banknote } from 'lucide-react';
import SubNav from '../../../components/common/SubNav';

export const STAFF_NAV_TABS = [
  {
    id: 'dashboard',
    to: '/staff',
    aliasTo: ['/staff/dashboard', '/finance/staff'],
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: '#1a2340',
  },
  {
    id: 'manage',
    to: '/staff/manage',
    aliasTo: ['/staff/add', '/finance/staff/manage'],
    label: 'Add / Manage Staff',
    icon: Users,
    color: '#009966',
  },
  {
    id: 'attendance',
    to: '/staff/attendance',
    aliasTo: ['/finance/staff/attendance'],
    label: 'Attendance',
    icon: CheckSquare,
    color: '#155dfc',
  },
  {
    id: 'salary',
    to: '/staff/salary',
    aliasTo: ['/staff/payroll', '/finance/staff/salary'],
    label: 'Salary Payment',
    icon: Banknote,
    color: '#7c3aed',
  },
  {
    id: 'dailysheet',
    to: '/staff/dailysheet',
    aliasTo: ['/staff/daily-sheet', '/finance/staff/dailysheet', '/finance/staff/daily-sheet'],
    label: 'Daily Sheet',
    icon: FileSpreadsheet,
    color: '#d97706',
  },
];

export default function StaffNav() {
  return <SubNav tabs={STAFF_NAV_TABS} />;
}
