import React from 'react';
import {
  LayoutGrid,
  Users,
  Droplets,
  Receipt,
  TrendingUp,
  FileText,
} from 'lucide-react';
import SubNav from '../../../components/common/SubNav';

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
    aliasTo: ['/supplier/procurementsheet', '/supplier/procurement-sheet'],
    label: 'Procurement Sheet',
    icon: FileText,
    color: '#d97706', // Orange
  },
];

export default function SupplierNav() {
  return <SubNav tabs={SUPPLIER_TABS} />;
}
