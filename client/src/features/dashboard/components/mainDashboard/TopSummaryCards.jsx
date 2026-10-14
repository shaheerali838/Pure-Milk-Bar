import React, { useState, useMemo } from 'react';
import { Droplets, Layers, ShoppingBag, ArrowDownLeft, ChevronRight, Banknote, TrendingUp } from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { useExpense } from '@/context/ExpenseContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { getPktTodayString, getDateRangeBoundaries, isDateInFilterRange, isMatchingTimeframe } from '@/utils/dateUtils';
import { Link } from 'react-router-dom';
import { KpiGridSkeleton } from '@/components/ui/skeleton';
import CombinedBusinessPLModal from './CombinedBusinessPLModal';
import CombinedMilkSourcedModal from './CombinedMilkSourcedModal';

export default function TopSummaryCards({
  dateFilter = 'today',
  startDate = '',
  endDate = '',
  timeRange,
  customStartDate = '',
  customEndDate = '',
}) {
  const activeRange = dateFilter || timeRange || 'today';
  const activeStart = startDate || customStartDate || '';
  const activeEnd = endDate || customEndDate || '';
  const { animals = [], milkingLogs = [], isLoading: isAnimalsLoading } = useAnimalContext();
  const { intakeLogs = [], totals: intakeTotals = {}, isLoading: isIntakeLoading } = useIntakeContext();
  const { salesHistory = [], inventoryMetrics = {}, businessFinancialMetrics = {} } = usePOSContext();
  const { ledgers = {}, getAllCustomersAggregates } = useLedgerContext() || {};
  const { totalKhataReceivable = 0, withKhataBalCount = 0 } = useCustomerContext() || {};
  const { expenses: farmExpenses = [] } = useExpense() || {};
  const { expenses: supplierExpenses = [] } = useSourcExpenseContext() || {};

  // Filtered dataset calculations based on timeRange
  const dateMetrics = useMemo(() => {
    // 1. Milking Logs within timeframe
    const matchedMilking = milkingLogs.filter((l) =>
      isMatchingTimeframe(l.date, activeRange, activeStart, activeEnd)
    );
    const farmYield =
      activeRange === 'today' && matchedMilking.length === 0
        ? Number(inventoryMetrics.totalFarmYield) || 0
        : matchedMilking.reduce((sum, l) => sum + (parseFloat(l.yieldLiters || l.yield) || 0), 0);

    // 2. Intake Logs within timeframe
    const matchedIntakes = intakeLogs.filter((i) =>
      isMatchingTimeframe(i.date, activeRange, activeStart, activeEnd)
    );
    const procuredVolume =
      activeRange === 'today' && matchedIntakes.length === 0 && intakeTotals.totalProcuredVolume !== undefined
        ? intakeTotals.totalProcuredVolume
        : matchedIntakes.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0);

    const totalSourced = farmYield + procuredVolume;

    // 3. Sales History within timeframe
    const matchedSales = salesHistory.filter((s) => {
      const raw = s.date || s.timestamp || s.formattedDate || s.createdAt || '';
      return isMatchingTimeframe(raw, activeRange, activeStart, activeEnd);
    });

    let salesRevenue = 0;
    let milkSoldQty = 0;
    let milkSalesRevenue = 0;
    let dahiSoldQty = 0;
    let dahiSalesRevenue = 0;
    let otherSoldQty = 0;
    let otherSalesRevenue = 0;

    let farmMilkSoldQty = 0;
    let supplierMilkSoldQty = 0;
    let farmMilkRevenue = 0;
    let supplierMilkRevenue = 0;

    let farmDahiSoldQty = 0;
    let supplierDahiSoldQty = 0;
    let farmDahiRevenue = 0;
    let supplierDahiRevenue = 0;

    matchedSales.forEach((sale) => {
      salesRevenue += Number(sale.netPayable || sale.totalAmount || sale.grandTotal) || 0;
      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const src = (item.source || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal || item.effectiveRevenue) || qty * (Number(item.price) || 0);
        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt') || cat.includes('yogurt') || name.includes('curd');
        const isMilk = !isDahi && (name.includes('milk') || cat.includes('milk') || name.includes('cow') || cat.includes('cow') || name.includes('buffalo') || cat.includes('buffalo'));

        // Determine farm vs supplier attribution
        let fRev = 0;
        let sRev = 0;
        let fQty = 0;
        let sQty = 0;

        if (item.supplierRevenue !== undefined && Number(item.supplierRevenue) > 0) {
          sRev = Number(item.supplierRevenue);
          sQty = Number(item.supplierQuantity) || (src.includes('supplier') ? qty : 0);
          fRev = Number(item.farmRevenue) || 0;
          fQty = Number(item.farmQuantity) || 0;
        } else if (item.farmRevenue !== undefined && Number(item.farmRevenue) > 0) {
          fRev = Number(item.farmRevenue);
          fQty = Number(item.farmQuantity) || (src.includes('farm') ? qty : 0);
          sRev = 0;
          sQty = 0;
        } else if (item.farmDahiRevenue !== undefined && Number(item.farmDahiRevenue) > 0) {
          fRev = Number(item.farmDahiRevenue);
          fQty = Number(item.farmQuantity) || qty;
          sRev = 0;
          sQty = 0;
        } else if (item.supplierRatio !== undefined || item.farmRatio !== undefined) {
          const sRatio = Number(item.supplierRatio) || 0;
          const fRatio = Number(item.farmRatio) || 0;
          sRev = Math.round(rev * sRatio);
          fRev = rev - sRev;
          sQty = Number((qty * sRatio).toFixed(2));
          fQty = Number((qty * fRatio).toFixed(2));
        } else if (src.includes('supplier') || name.includes('supplier') || cat.includes('supplier')) {
          sRev = rev;
          sQty = qty;
        } else if (src.includes('farm') || name.includes('farm') || cat.includes('farm')) {
          fRev = rev;
          fQty = qty;
        } else {
          // If no explicit source:
          if (name.includes('cow') || cat.includes('cow')) {
            fRev = rev;
            fQty = qty;
          } else {
            fRev = rev;
            fQty = qty;
          }
        }

        if (isDahi) {
          dahiSoldQty += qty;
          dahiSalesRevenue += rev;
          farmDahiSoldQty += fQty;
          supplierDahiSoldQty += sQty;
          farmDahiRevenue += fRev;
          supplierDahiRevenue += sRev;
        } else if (isMilk) {
          milkSoldQty += qty;
          milkSalesRevenue += rev;
          farmMilkSoldQty += fQty;
          supplierMilkSoldQty += sQty;
          farmMilkRevenue += fRev;
          supplierMilkRevenue += sRev;
        } else {
          otherSoldQty += qty;
          otherSalesRevenue += rev;
          if (sRev > 0) supplierMilkRevenue += sRev;
          else farmMilkRevenue += fRev;
        }
      });
    });

    const totalFarmRevenue = farmMilkRevenue + farmDahiRevenue;
    const totalSupplierRevenue = supplierMilkRevenue + supplierDahiRevenue;

    // 4. Expenses within timeframe
    const matchedFarmExp = farmExpenses.filter((e) =>
      isMatchingTimeframe(e.date || e.createdAt, activeRange, activeStart, activeEnd)
    );
    const totalFarmExp = matchedFarmExp.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const matchedSupExp = supplierExpenses.filter((e) =>
      isMatchingTimeframe(e.date || e.createdAt, activeRange, activeStart, activeEnd)
    );
    const totalSupExp = matchedSupExp.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totalProcurementCost = matchedIntakes.reduce((s, i) => s + (Number(i.totalCost || i.totalAmount) || 0), 0);

    // Dynamic Net Profits for period (incorporating both liquid milk and dahi revenues)
    const calculatedFNetProfit = totalFarmRevenue - totalFarmExp;
    const calculatedSNetProfit = totalSupplierRevenue - (totalProcurementCost + totalSupExp);
    const calculatedTotNetProfit = salesRevenue - (totalFarmExp + totalProcurementCost + totalSupExp);

    const fNetProfit = activeRange === 'today' && businessFinancialMetrics?.farmNetProfit !== undefined
      ? Number(businessFinancialMetrics.farmNetProfit)
      : calculatedFNetProfit;

    const sNetProfit = activeRange === 'today' && businessFinancialMetrics?.supplierNetProfit !== undefined
      ? Number(businessFinancialMetrics.supplierNetProfit)
      : calculatedSNetProfit;

    const totNetProfit = activeRange === 'today' && businessFinancialMetrics?.totalBusinessNetProfit !== undefined
      ? Number(businessFinancialMetrics.totalBusinessNetProfit)
      : calculatedTotNetProfit;

    const margin = salesRevenue > 0 ? Math.round((totNetProfit / salesRevenue) * 100) : 0;

    // 5. Recoveries
    let ledgerSum = 0;
    Object.values(ledgers).forEach((entries) => {
      (entries || []).forEach((entry) => {
        if (
          (entry.type === 'CREDIT' || Number(entry.credit) > 0) &&
          isMatchingTimeframe(entry.date || entry.createdAt, activeRange, activeStart, activeEnd)
        ) {
          ledgerSum += Number(entry.credit) || 0;
        }
      });
    });

    return {
      farmYield,
      procuredVolume,
      totalSourced,
      salesRevenue,
      orderCount: matchedSales.length,
      milkSoldQty,
      milkSalesRevenue,
      farmMilkSoldQty,
      supplierMilkSoldQty,
      farmMilkRevenue,
      supplierMilkRevenue,
      farmDahiSoldQty,
      supplierDahiSoldQty,
      farmDahiRevenue,
      supplierDahiRevenue,
      totalFarmRevenue,
      totalSupplierRevenue,
      dahiSoldQty,
      dahiSalesRevenue,
      farmNetProfit: fNetProfit,
      supplierNetProfit: sNetProfit,
      totalNetProfit: totNetProfit,
      netMargin: margin,
      recoveries: ledgerSum,
    };
  }, [
    milkingLogs,
    intakeLogs,
    salesHistory,
    farmExpenses,
    supplierExpenses,
    ledgers,
    activeRange,
    activeStart,
    activeEnd,
    inventoryMetrics,
    intakeTotals,
    businessFinancialMetrics,
  ]);

  const periodData = getDateRangeBoundaries(activeRange, activeStart, activeEnd);
  const periodLabel = periodData.label;

  if (isAnimalsLoading && isIntakeLoading && animals.length === 0 && intakeLogs.length === 0) {
    return <KpiGridSkeleton count={8} />;
  }

  const customerAggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : null;
  const pendingKhataTotal = customerAggregates?.totalAllDue !== undefined ? customerAggregates.totalAllDue : totalKhataReceivable;
  const pendingAccountsCount = customerAggregates?.khataAccountsCount ?? withKhataBalCount;

  const totalMilkStock = inventoryMetrics?.totalMilkStock ?? '0';
  const farmMilkStock = inventoryMetrics?.farmMilkStock ?? '0';
  const supplierMilkStock = inventoryMetrics?.supplierMilkStock ?? '0';

  const [showCombinedPLModal, setShowCombinedPLModal] = useState(false);
  const [showCombinedSourcedModal, setShowCombinedSourcedModal] = useState(false);

  const isToday = activeRange === 'today';
  const timeSuffix = isToday ? ' Today' : '';

  const cards = [
    {
      id: 'total-net-profit',
      title: 'Total Business Net Profit',
      value: `Rs. ${dateMetrics.totalNetProfit < 0 ? '-' : ''}${Math.abs(dateMetrics.totalNetProfit).toLocaleString()}`,
      subtitle: `${dateMetrics.netMargin}% Margin`,
      icon: Banknote,
      color: dateMetrics.totalNetProfit >= 0 ? '#059669' : '#dc2626',
      tag: 'Main P&L',
      onClick: () => setShowCombinedPLModal(true),
    },
    {
      id: 'farm-net-profit',
      title: 'Farm Net Profit',
      value: `Rs. ${dateMetrics.farmNetProfit < 0 ? '-' : ''}${Math.abs(dateMetrics.farmNetProfit).toLocaleString()}`,
      subtitle: `In-House Dairy P&L`,
      icon: TrendingUp,
      color: dateMetrics.farmNetProfit >= 0 ? '#009966' : '#dc2626',
      tag: 'Farm P&L',
      to: '/farm/pl',
    },
    {
      id: 'supplier-net-profit',
      title: 'Supplier Net Profit',
      value: `Rs. ${dateMetrics.supplierNetProfit < 0 ? '-' : ''}${Math.abs(dateMetrics.supplierNetProfit).toLocaleString()}`,
      subtitle: `Procurement P&L`,
      icon: TrendingUp,
      color: dateMetrics.supplierNetProfit >= 0 ? '#0284c7' : '#dc2626',
      tag: 'Supplier P&L',
      to: '/supplier/pl',
    },
    {
      id: 'available-milk-stock',
      title: 'Total Milk Stock',
      value: `${totalMilkStock} L`,
      subtitle: `Farm: ${farmMilkStock}L · Sup: ${supplierMilkStock}L`,
      icon: Droplets,
      color: '#059669',
      tag: 'Stock',
      to: '/pos',
    },
    {
      id: 'total-sourced',
      title: activeRange === 'today' ? 'Total Milk Sourced Today' : `Milk Sourced (${periodLabel})`,
      value: `${dateMetrics.totalSourced.toFixed(1)} L`,
      subtitle: `Farm: ${dateMetrics.farmYield.toFixed(0)}L · Sup: ${dateMetrics.procuredVolume.toFixed(0)}L`,
      icon: Droplets,
      color: '#155dfc',
      tag: periodLabel,
      onClick: () => setShowCombinedSourcedModal(true),
    },
    {
      id: 'todays-milk-sold',
      title: activeRange === 'today' ? "Total Milk Sold Today" : `Milk Sold (${periodLabel})`,
      value: `${Number(dateMetrics.milkSoldQty.toFixed(1))} L`,
      subtitle: `Farm: ${Number(dateMetrics.farmMilkSoldQty.toFixed(1))}L · Sup: ${Number(dateMetrics.supplierMilkSoldQty.toFixed(1))}L`,
      icon: Droplets,
      color: '#10b981',
      tag: periodLabel,
      to: '/pos',
    },
    {
      id: 'todays-milk-revenue',
      title: activeRange === 'today' ? "Milk Sales Revenue" : `Milk Revenue (${periodLabel})`,
      value: `Rs. ${dateMetrics.milkSalesRevenue.toLocaleString()}`,
      subtitle: `Farm: Rs. ${dateMetrics.farmMilkRevenue.toLocaleString()} · Sup: Rs. ${dateMetrics.supplierMilkRevenue.toLocaleString()}`,
      icon: Banknote,
      color: '#059669',
      tag: periodLabel,
      to: '/pos',
    },
    {
      id: 'todays-dahi-sold',
      title: activeRange === 'today' ? "Today's Dahi Sold" : `Dahi Sold (${periodLabel})`,
      value: `${Number(dateMetrics.dahiSoldQty.toFixed(1))} kg`,
      subtitle: `Farm + Supplier Dahi`,
      icon: Layers,
      color: '#009966',
      tag: periodLabel,
      to: '/pos',
    },
    {
      id: 'todays-sales',
      title: activeRange === 'today' ? "Total Business Revenue" : `Total Revenue (${periodLabel})`,
      value: `Rs. ${dateMetrics.salesRevenue.toLocaleString()}`,
      subtitle: `${dateMetrics.orderCount} orders${isToday ? ' today' : ' in period'}`,
      icon: ShoppingBag,
      color: '#059669',
      tag: 'POS Sales',
      to: '/pos',
    },
    {
      id: 'recoveries',
      title: 'Recoveries',
      value: `Rs. ${(dateMetrics.recoveries || 0).toLocaleString()}`,
      subtitle: `${pendingAccountsCount} accounts · Due: Rs. ${Number(pendingKhataTotal || 0).toLocaleString()}`,
      icon: ArrowDownLeft,
      color: '#d97706',
      tag: 'Recovery',
      to: '/customer-khata-ledger',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {cards.map((card) => {
          const Icon = card.icon;
          const cardContent = (
            <>
              <div className="flex items-start justify-between mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: `${card.color}15` }}
                >
                  <Icon style={{ width: 15, height: 15, color: card.color }} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                    {card.tag}
                  </span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </div>

              <div>
                <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
                  {card.value}
                </p>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{card.title}</p>
                <p className="text-[10px] font-medium text-slate-400 line-clamp-1">
                  {card.subtitle}
                </p>
              </div>
            </>
          );

          if (card.onClick) {
            return (
              <button
                key={card.id}
                type="button"
                onClick={card.onClick}
                className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs hover:border-slate-300 text-left group cursor-pointer w-full"
                title={`Open ${card.title} Breakdown`}
              >
                {cardContent}
              </button>
            );
          }

          return (
            <Link
              key={card.id}
              to={card.to}
              className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs hover:border-slate-300 group cursor-pointer"
              title={`Open ${card.title}`}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Combined Business P&L Modal (Farm + Supplier + Dahi) */}
      <CombinedBusinessPLModal
        isOpen={showCombinedPLModal}
        onClose={() => setShowCombinedPLModal(false)}
        dateMetrics={dateMetrics}
        periodLabel={periodLabel}
      />

      {/* Combined Milk Sourced Modal (Farm + Supplier) */}
      <CombinedMilkSourcedModal
        isOpen={showCombinedSourcedModal}
        onClose={() => setShowCombinedSourcedModal(false)}
        dateMetrics={dateMetrics}
        inventoryMetrics={inventoryMetrics}
        periodLabel={periodLabel}
      />
    </>
  );
}
