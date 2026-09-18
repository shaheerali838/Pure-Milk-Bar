import { ClipboardCheck, History, Users2, SlidersHorizontal } from 'lucide-react';

export const reconciliationLinks = [
  {
    id: 'daily-closing',
    name: 'Daily Closing & Audit',
    icon: ClipboardCheck,
    path: '/finance/daily-closing',
    iconBg: 'bg-[#ecfdf5]',
    iconColor: 'text-[#059669]',
    iconBorder: 'border border-[#d1fae5]',
    activeBg: 'bg-[#00a86b] text-white shadow-md shadow-emerald-500/25',
    activeBadgeBg: 'bg-[#008f5b] text-white',
  },
  {
    id: 'transaction-audit-log',
    name: 'Transaction Audit Log',
    icon: History,
    path: '/finance/audit-log',
    iconBg: 'bg-[#eff6ff]',
    iconColor: 'text-[#2563eb]',
    iconBorder: 'border border-[#dbeafe]',
    activeBg: 'bg-[#2563eb] text-white shadow-md shadow-blue-500/25',
    activeBadgeBg: 'bg-[#1d4ed8] text-white',
  },
  {
    id: 'staff-payroll',
    name: 'Staff & Payroll',
    icon: Users2,
    path: '/staff',
    iconBg: 'bg-[#f5f3ff]',
    iconColor: 'text-[#7c3aed]',
    iconBorder: 'border border-[#ede9fe]',
    activeBg: 'bg-[#7c3aed] text-white shadow-md shadow-purple-500/25',
    activeBadgeBg: 'bg-[#6d28d9] text-white',
  },
  {
    id: 'global-settings',
    name: 'Global Settings',
    icon: SlidersHorizontal,
    path: '/settings',
    iconBg: 'bg-[#ecfdf5]',
    iconColor: 'text-[#059669]',
    iconBorder: 'border border-[#d1fae5]',
    activeBg: 'bg-[#00a86b] text-white shadow-md shadow-emerald-500/25',
    activeBadgeBg: 'bg-[#008f5b] text-white',
  },
];

export default reconciliationLinks;

