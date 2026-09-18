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

export default function TopSummaryCards() {
  const { animals = [] } = useAnimalContext();
  const { intakeLogs = [], totals: intakeTotals = {} } = useIntakeContext();
  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext();
  const { ledgers = {} } = useLedgerContext();

  // 1. Farm Milk Production
  const totalFarmMilk = animals.reduce(
    (sum, a) => sum + (parseFloat(a.totalDailyYield) || 0),
    0
  );
  const milkingAnimalsCount = animals.filter(
    (a) => a.lactationStatus === 'Milking' || parseFloat(a.totalDailyYield) > 0
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
    const saleDate = s.timestamp ? s.timestamp.split('T')[0] : (s.formattedDate ? s.formattedDate.split('T')[0] : '');
    return saleDate === todayISO;
  });
  const todaySalesRevenue = (todaySales.length > 0 ? todaySales : salesHistory).reduce(
    (sum, s) => sum + (Number(s.netPayable) || 0),
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

  const cards = [
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            to={card.to}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-slate-300 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer select-none group"
            style={{ borderTop: `4px solid ${card.color}` }}
            title={`Open ${card.title}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                style={{ background: `${card.color}15` }}
              >
                <Icon style={{ width: 16, height: 16, color: card.color }} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
                  {card.tag}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
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
