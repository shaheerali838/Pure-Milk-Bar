import React, { useMemo } from 'react';
import { Users, Droplets, Tag, Banknote, PackageCheck } from 'lucide-react';
import { useSupplierContext } from '@/context/SupplierContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';
import { useDahiContext } from '@/context/DahiContext';
import { isMatchingTimeframe } from '@/utils/dateUtils';

export default function SupplierDashboardCard({
  timeRange = 'today',
  customStartDate = '',
  customEndDate = '',
}) {
  const { totals: supplierTotals } = useSupplierContext();
  const { intakeLogs = [] } = useIntakeContext();
  const posCtx = usePOSContext();
  const dahiCtx = useDahiContext();

  const availableSupplierStock = useMemo(() => {
    if (posCtx?.inventoryMetrics?.rawSupplierMilkStock !== undefined) {
      return Math.max(0, Number(posCtx.inventoryMetrics.rawSupplierMilkStock) || 0);
    }
    if (dahiCtx?.metrics?.remainingSupplierMilk !== undefined) {
      return Math.max(0, Number(dahiCtx.metrics.remainingSupplierMilk) || 0);
    }
    return 0;
  }, [posCtx?.inventoryMetrics?.rawSupplierMilkStock, dahiCtx?.metrics?.remainingSupplierMilk]);

  const cowStock = useMemo(() => {
    return Math.max(0, Number(posCtx?.inventoryMetrics?.rawSupplierCowMilkStock) || 0);
  }, [posCtx?.inventoryMetrics?.rawSupplierCowMilkStock]);

  const buffStock = useMemo(() => {
    return Math.max(0, Number(posCtx?.inventoryMetrics?.rawSupplierBuffaloMilkStock) || 0);
  }, [posCtx?.inventoryMetrics?.rawSupplierBuffaloMilkStock]);

  const periodData = useMemo(() => {
    const matchedLogs = (intakeLogs || []).filter((log) =>
      isMatchingTimeframe(log.date, timeRange, customStartDate, customEndDate)
    );

    const periodVolume = matchedLogs.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const periodCost = matchedLogs.reduce((sum, item) => sum + (parseFloat(item.totalCost || item.totalAmount) || 0), 0);
    const avgRate = periodVolume > 0 ? periodCost / periodVolume : 0;

    return { periodVolume, periodCost, avgRate, logCount: matchedLogs.length };
  }, [intakeLogs, timeRange, customStartDate, customEndDate]);

  const isToday = timeRange === 'today';
  const periodTitle = isToday ? "Today's Procurement" : 'Procurement Volume';

  const cards = [
    {
      id: 'available_stock',
      title: 'Available Stock (With Me)',
      amount: `${availableSupplierStock % 1 === 0 ? availableSupplierStock.toFixed(0) : availableSupplierStock.toFixed(1)} L`,
      sub: (cowStock > 0 || buffStock > 0)
        ? `Cow: ${cowStock % 1 === 0 ? cowStock.toFixed(0) : cowStock.toFixed(1)} L · Buff: ${buffStock % 1 === 0 ? buffStock.toFixed(0) : buffStock.toFixed(1)} L`
        : 'Live In-Stock Liquid Milk',
      icon: PackageCheck,
      color: '#059669', // emerald-600
      badge: 'Available',
    },
    {
      id: 'today_procurement',
      title: periodTitle,
      amount: `${periodData.periodVolume.toFixed(1)} L`,
      sub: `Cost: Rs. ${periodData.periodCost.toLocaleString()} · ${periodData.logCount} Batches`,
      icon: Droplets,
      color: '#2563eb', // blue-600
      badge: isToday ? 'Intake' : 'Period Intake',
    },
    {
      id: 'avg_purchase_rate',
      title: 'Avg Purchase Rate',
      amount: `Rs. ${periodData.avgRate.toFixed(1)} / L`,
      sub: isToday ? "Based on Today's Batches" : 'Based on Selected Batches',
      icon: Tag,
      color: '#9333ea', // purple-600
      badge: 'Pricing',
    },
    {
      id: 'supplier_payables',
      title: 'Supplier Payables',
      amount: `Rs. ${(supplierTotals?.outstandingBalances || 0).toLocaleString()}`,
      sub: 'Total Pending Vendor Balance',
      icon: Banknote,
      color: '#d97706', // amber-600
      badge: 'Finance',
    },
    {
      id: 'active_suppliers',
      title: 'Active Suppliers',
      amount: `${supplierTotals?.activeVendors || 0} Suppliers`,
      sub: `${supplierTotals?.activeVendors || 0} Active · ${supplierTotals?.inactiveVendors || 0} Inactive`,
      icon: Users,
      color: '#4f46e5', // indigo-600
      badge: 'Network',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs"
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
