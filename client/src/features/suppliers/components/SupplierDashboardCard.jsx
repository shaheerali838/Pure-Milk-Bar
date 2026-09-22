import React, { useMemo } from 'react';
import { Users, Droplets, Tag, Wallet, CheckCircle2 } from 'lucide-react';
import { useSupplierContext } from '@/context/SupplierContext';
import { useIntakeContext } from '@/context/IntakeContext';

export default function SupplierDashboardCard() {
  const { totals: supplierTotals } = useSupplierContext();
  const { intakeLogs } = useIntakeContext();

  const todayData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = (intakeLogs || []).filter((log) => log.date === todayStr);

    const todayVolume = todayLogs.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const todayCost = todayLogs.reduce((sum, item) => sum + (parseFloat(item.totalCost) || 0), 0);
    const avgRate = todayVolume > 0 ? todayCost / todayVolume : 0;

    return { todayVolume, todayCost, avgRate, logCount: todayLogs.length };
  }, [intakeLogs]);

  const cards = [
    {
      id: 'active_suppliers',
      title: 'Active Suppliers',
      amount: `${supplierTotals?.activeVendors || 0} Suppliers`,
      sub: `${supplierTotals?.activeVendors || 0} Active · ${supplierTotals?.inactiveVendors || 0} Inactive`,
      icon: Users,
      color: '#4f46e5', // indigo-600
      badge: 'Network',
    },
    {
      id: 'today_procurement',
      title: 'Today\'s Procurement',
      amount: `${todayData.todayVolume.toFixed(1)} L`,
      sub: `Cost: Rs. ${todayData.todayCost.toLocaleString()} · ${todayData.logCount} Batches`,
      icon: Droplets,
      color: '#2563eb', // blue-600
      badge: 'Intake',
    },
    {
      id: 'avg_purchase_rate',
      title: 'Avg Purchase Rate',
      amount: `Rs. ${todayData.avgRate.toFixed(1)} / L`,
      sub: 'Based on Today\'s Batches',
      icon: Tag,
      color: '#9333ea', // purple-600
      badge: 'Pricing',
    },
    {
      id: 'supplier_payables',
      title: 'Supplier Payables',
      amount: `Rs. ${(supplierTotals?.outstandingBalances || 0).toLocaleString()}`,
      sub: 'Total Pending Vendor Balance',
      icon: Wallet,
      color: '#d97706', // amber-600
      badge: 'Finance',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs"
          style={{ borderTop: `3.5px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                {badge}
              </span>
            </div>
          </div>

          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {amount}
            </p>
            <p className="text-xs font-bold text-slate-800">{title}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
