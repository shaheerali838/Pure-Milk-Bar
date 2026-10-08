import React from 'react';
import {
  LayoutDashboard,
  Beef,
  Droplets,
  Receipt,
  TrendingUp,
  FileText,
} from 'lucide-react';
import SubNav from '../../../components/common/SubNav';

const FARM_TABS = [
  { to: '/farm', label: 'Dashboard', icon: LayoutDashboard, color: '#1a2340' },
  { to: '/farm/animals', label: 'Animals & Herd', icon: Beef, color: '#009966' },
  { to: '/farm/milking', label: 'Milking Register', icon: Droplets, color: '#155dfc' },
  { to: '/farm/expenses', label: 'Farm Expenses', icon: Receipt, color: '#4f39f6' },
  { to: '/farm/pl', label: 'Farm P&L', icon: TrendingUp, color: '#0092b8' },
  { to: '/farm/dailysheet', aliasTo: ['/farm/daily-sheet', '/dailysheet', '/daily-sheet'], label: 'Daily Sheet', icon: FileText, color: '#d97706' },
];

export default function FarmNav() {
  return <SubNav tabs={FARM_TABS} />;
}
