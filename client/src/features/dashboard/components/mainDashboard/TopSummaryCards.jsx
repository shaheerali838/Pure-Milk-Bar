import React from 'react';
import {
  Droplets,
  Beef,
  Truck,
  Layers,
  ShoppingBag,
  ArrowDownLeft,
  ChevronRight,
} from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';
import { useLedgerContext } from '@/context/LedgerContext';

import { Link } from 'react-router-dom';
import { KpiGridSkeleton } from '@/components/ui/skeleton';

export default function TopSummaryCards() {
  const { animals = [], isLoading: isAnimalsLoading } = useAnimalContext();
  const { intakeLogs = [], totals: intakeTotals = {}, isLoading: isIntakeLoading } = useIntakeContext();
  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext();
  const { ledgers = {} } = useLedgerContext();

  if (isAnimalsLoading && isIntakeLoading && animals.length === 0 && intakeLogs.length === 0) {
    return <KpiGridSkeleton count={8} />;
  }

  // 1. Farm Milk Production
  const totalFarmMilk = Number(inventoryMetrics.totalFarmYield) || 0;
  const milkingAnimalsCount = animals.filter(
    (a) => a.lactationStatus === 'Milking'
  ).length;

  // 2. Purchased Supplier Milk
  const totalProcuredMilk =
    intakeTotals.totalProcuredVolume !== undefined
      ? intakeTotals.totalProcuredVolume
      : intakeLogs.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0);
  const avgPurchaseRate =
    intakeTotals.avgPurchaseRate ||
    (totalProcuredMilk > 0
      ? intakeLogs.reduce((sum, i) => sum + (parseFloat(i.totalCost) || 0), 0) /
        totalProcuredMilk
      : 0);

  // 3. Total Milk Sourced (Farm + Procurement)
  const totalMilkSourced = totalFarmMilk + totalProcuredMilk;

  // 4. Dahi & Value-Add Converted
  const dahiMilkEquivalent =
    parseFloat(inventoryMetrics.totalDahi) ||
    parseFloat(inventoryMetrics.dahiSold) ||
    0;

  // 5. Today's POS Sales Revenue
  const todayISO = new Date().toISOString().split('T')[0];
  const todaySales = salesHistory.filter((s) => {
    const raw = s.date || s.timestamp || s.formattedDate || '';
    const saleDate = raw.includes('T') ? raw.split('T')[0] : (raw.includes('-') ? raw.slice(0, 10) : '');
    return saleDate === todayISO || s.date === todayISO;
  });
  const todaySalesRevenue = todaySales.reduce(
    (sum, s) => sum + (Number(s.netPayable || s.totalAmount || s.grandTotal) || 0),
    0
  );

  // 6. Recoveries (Credit payments into Ledgers)
  let totalRecoveries = 0;
  Object.values(ledgers).forEach((entries) => {
    (entries || []).forEach((entry) => {
      if (entry.type === 'CREDIT' || Number(entry.credit) > 0) {
        totalRecoveries += Number(entry.credit) || 0;
      }
    });
  });

  const totalMilkStock = inventoryMetrics?.totalMilkStock ?? '0';
  const farmMilkStock = inventoryMetrics?.farmMilkStock ?? '0';
  const supplierMilkStock = inventoryMetrics?.supplierMilkStock ?? '0';
  const totalDahiStock = inventoryMetrics?.totalDahiStock ?? '0';

  const cards = [
    {
      id: 'available-milk-stock',
      title: 'Available Milk Stock',
      value: `${totalMilkStock} L`,
      subtitle: `Farm: ${farmMilkStock}L • Sup: ${supplierMilkStock}L`,
      icon: Droplets,
      color: '#059669',
      tag: 'Chiller Stock',
      to: '/pos',
    },
    {
      id: 'available-dahi-stock',
      title: 'Available Dahi Stock',
      value: `${totalDahiStock} kg`,
      subtitle: 'Ready at POS counter',
      icon: Layers,
      color: '#0284c7',
      tag: 'Counter Stock',
      to: '/farm/processing',
    },
    {
      id: 'total-sourced',
      title: 'Total Milk Sourced',
      value: `${totalMilkSourced.toFixed(1)} L`,
      subtitle: `Farm: ${totalFarmMilk.toFixed(0)}L • Procured: ${totalProcuredMilk.toFixed(0)}L`,
      icon: Droplets,
      color: '#155dfc',
      tag: 'Combined Inflow',
      to: '/supplier/intake',
    },
    {
      id: 'farm-production',
      title: 'Farm Production',
      value: `${totalFarmMilk.toFixed(1)} L`,
      subtitle: `${milkingAnimalsCount} active milking herd`,
      icon: Beef,
      color: '#009966',
      tag: 'Internal Herd',
      to: '/farm',
    },
    {
      id: 'purchased-milk',
      title: 'Purchased Milk',
      value: `${totalProcuredMilk.toFixed(1)} L`,
      subtitle: `Avg: Rs. ${Math.round(avgPurchaseRate)}/L`,
      icon: Truck,
      color: '#4f39f6',
      tag: `${intakeLogs.length} Batches`,
      to: '/supplier/intake',
    },
    {
      id: 'dahi-value-add',
      title: 'Dahi & Value-Add',
      value: `${dahiMilkEquivalent.toFixed(0)} kg`,
      subtitle: 'Value add conversion',
      icon: Layers,
      color: '#0092b8',
      tag: 'Processing',
      to: '/farm/processing',
    },
    {
      id: 'todays-sales',
      title: "Today's Sales",
      value: `Rs. ${todaySalesRevenue.toLocaleString()}`,
      subtitle: `${todaySales.length} orders today`,
      icon: ShoppingBag,
      color: '#10b981',
      tag: 'Live Counter',
      to: '/pos',
    },
    {
      id: 'recoveries',
      title: 'Recoveries',
      value: `Rs. ${totalRecoveries.toLocaleString()}`,
      subtitle: 'Khata receivables collected',
      icon: ArrowDownLeft,
      color: '#d97706',
      tag: 'Recovery',
      to: '/customer-khata-ledger',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            to={card.to}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none group relative overflow-hidden"
            title={`Open ${card.title}`}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                style={{ background: `${card.color}18` }}
              >
                <Icon style={{ width: 18, height: 18, color: card.color }} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-slate-700 bg-slate-100/90 shadow-2xs">
                  {card.tag}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 font-display tabular">
                {card.value}
              </p>
              <p className="text-xs font-bold text-slate-700">{card.title}</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                {card.subtitle}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
