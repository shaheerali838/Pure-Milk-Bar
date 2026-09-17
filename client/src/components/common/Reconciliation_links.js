import { ClipboardCheck, Users } from 'lucide-react';

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
    id: 'staff',
    name: 'Staff Management',
    icon: Users,
    path: '/staff',
    iconBg: 'bg-[#eff6ff]',
    iconColor: 'text-[#2563eb]',
    iconBorder: 'border border-[#dbeafe]',
    activeBg: 'bg-[#00a86b] text-white shadow-md shadow-emerald-500/25',
    activeBadgeBg: 'bg-[#008f5b] text-white',
  },
];

export default reconciliationLinks;

