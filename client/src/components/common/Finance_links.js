import { Wallet, Bike, Users } from 'lucide-react';

export const financeLinks = [
  {
    id: 'customer-finance',
    name: 'Customer Finance',
    icon: Wallet,
    path: '/finance/customer',
    iconBg: 'bg-[#eef4ff]',
    iconColor: 'text-[#2563eb]',
    iconBorder: 'border border-[#dbeafe]',
    activeBg: 'bg-[#1864f7] text-white shadow-md shadow-blue-500/25',
    activeBadgeBg: 'bg-[#0f4ec4] text-white',
  },
  {
    id: 'rider-delivery-finance',
    name: 'Rider & Delivery Finance',
    icon: Bike,
    path: '/finance/delivery',
    iconBg: 'bg-[#faf5ff]',
    iconColor: 'text-[#9333ea]',
    iconBorder: 'border border-[#f3e8ff]',
    activeBg: 'bg-[#7e22ce] text-white shadow-md shadow-purple-500/25',
    activeBadgeBg: 'bg-[#6b21a8] text-white',
  },
  {
    id: 'staff-management-finance',
    name: 'Staff Management',
    icon: Users,
    path: '/staff',
    iconBg: 'bg-[#ecfdf5]',
    iconColor: 'text-[#059669]',
    iconBorder: 'border border-[#a7f3d0]',
    activeBg: 'bg-[#059669] text-white shadow-md shadow-emerald-500/25',
    activeBadgeBg: 'bg-[#047857] text-white',
  },
];

export default financeLinks;
