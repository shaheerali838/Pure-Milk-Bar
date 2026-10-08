import React, { useMemo } from 'react';
import { Droplets, Layers, ShoppingBag, ArrowDownLeft, ChevronRight, Banknote, TrendingUp } from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { useExpense } from '@/context/ExpenseContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { isMatchingTimeframe } from '@/utils/dateUtils';
import { Link } from 'react-router-dom';
import { KpiGridSkeleton } from '@/components/ui/skeleton';

export default function TopSummaryCards({
  timeRange = 'today',
  customStartDate = '',
  customEndDate = '',
}) {
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
      isMatchingTimeframe(l.date, timeRange, customStartDate, customEndDate)
    );
    const farmYield =
      timeRange === 'today' && matchedMilking.length === 0
        ? Number(inventoryMetrics.totalFarmYield) || 0
        : matchedMilking.reduce((sum, l) => sum + (parseFloat(l.yieldLiters || l.yield) || 0), 0);

    // 2. Intake Logs within timeframe
    const matchedIntakes = intakeLogs.filter((i) =>
      isMatchingTimeframe(i.date, timeRange, customStartDate, customEndDate)
    );
    const procuredVolume =
      timeRange === 'today' && matchedIntakes.length === 0 && intakeTotals.totalProcuredVolume !== undefined
        ? intakeTotals.totalProcuredVolume
        : matchedIntakes.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0);

    const totalSourced = farmYield + procuredVolume;

    // 3. Sales History within timeframe
    const matchedSales = salesHistory.filter((s) => {
      const raw = s.date || s.timestamp || s.formattedDate || s.createdAt || '';
      return isMatchingTimeframe(raw, timeRange, customStartDate, customEndDate);
    });

    let salesRevenue = 0;
    let milkSoldQty = 0;
    let milkSalesRevenue = 0;
    let farmMilkSoldQty = 0;
    let supplierMilkSoldQty = 0;
    let farmMilkRevenue = 0;
    let supplierMilkRevenue = 0;
    let dahiSoldQty = 0;
    let dahiSalesRevenue = 0;

    matchedSales.forEach((sale) => {
      salesRevenue += Number(sale.netPayable || sale.totalAmount || sale.grandTotal) || 0;
      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal || item.effectiveRevenue) || qty * (Number(item.price) || 0);
        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt');

        if (isDahi) {
          dahiSoldQty += qty;
          dahiSalesRevenue += rev;
        } else {
          milkSoldQty += qty;
          milkSalesRevenue += rev;
          const fQty = item.farmQuantity !== undefined ? Number(item.farmQuantity) || 0 : (item.source === 'Farm' ? qty : 0);
          const sQty = item.supplierQuantity !== undefined ? Number(item.supplierQuantity) || 0 : (item.source === 'Supplier' ? qty : 0);
          const fRev = item.farmRevenue !== undefined ? Number(item.farmRevenue) || 0 : (item.source === 'Farm' ? rev : 0);
          const sRev = item.supplierRevenue !== undefined ? Number(item.supplierRevenue) || 0 : (item.source === 'Supplier' ? rev : 0);
          todayFarmMilkSoldQty(fQty);
          todaySupplierMilkSoldQty(sQty);
          todayFarmMilkRevenue(fRev);
          todaySupplierMilkRevenue(sRev);
        }
      });
    });

    function todayFarmMilkSoldQty(v) { farmMilkSoldQty += v; }
    function todaySupplierMilkSoldQty(v) { supplierMilkSoldQty += v; }
    function todayFarmMilkRevenue(v) { farmMilkRevenue += v; }
    function todaySupplierMilkRevenue(v) { supplierMilkRevenue += v; }

    // 4. Expenses within timeframe
    const matchedFarmExp = farmExpenses.filter((e) =>
      isMatchingTimeframe(e.date, timeRange, customStartDate, customEndDate)
    );
    const totalFarmExp = matchedFarmExp.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const matchedSupExp = supplierExpenses.filter((e) =>
      isMatchingTimeframe(e.date, timeRange, customStartDate, customEndDate)
    );
    const totalSupExp = matchedSupExp.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totalProcurementCost = matchedIntakes.reduce((s, i) => s + (Number(i.totalCost || i.totalAmount) || 0), 0);

    // Dynamic Net Profits for period
    const fNetProfit = farmMilkRevenue - totalFarmExp;
    const sNetProfit = supplierMilkRevenue - (totalProcurementCost + totalSupExp);
    const totNetProfit = salesRevenue - (totalFarmExp + totalProcurementCost + totalSupExp);
    const margin = salesRevenue > 0 ? Math.round((totNetProfit / salesRevenue) * 100) : 0;

    // 5. Recoveries
    let ledgerSum = 0;
    Object.values(ledgers).forEach((entries) => {
      (entries || []).forEach((entry) => {
        if (
          (entry.type === 'CREDIT' || Number(entry.credit) > 0) &&
          isMatchingTimeframe(entry.date || entry.createdAt, timeRange, customStartDate, customEndDate)
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
    timeRange,
    customStartDate,
    customEndDate,
    inventoryMetrics,
    intakeTotals,
  ]);

  if (isAnimalsLoading && isIntakeLoading && animals.length === 0 && intakeLogs.length === 0) {
    return <KpiGridSkeleton count={8} />;
  }

  const customerAggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : null;
  const pendingKhataTotal = customerAggregates?.totalAllDue !== undefined ? customerAggregates.totalAllDue : totalKhataReceivable;
  const pendingAccountsCount = customerAggregates?.khataAccountsCount ?? withKhataBalCount;

  const totalMilkStock = inventoryMetrics?.totalMilkStock ?? '0';
  const farmMilkStock = inventoryMetrics?.farmMilkStock ?? '0';
  const supplierMilkStock = inventoryMetrics?.supplierMilkStock ?? '0';

  const isToday = timeRange === 'today';
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
      to: '/farm/pl',
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
      to: '/farm/pl',
    },
    {
      id: 'available-milk-stock',
      title: 'Available Milk Stock (With Me)',
      value: `${totalMilkStock} L`,
      subtitle: `Farm: ${farmMilkStock}L · Sup: ${supplierMilkStock}L`,
      icon: Droplets,
      color: '#059669',
      tag: 'Stock',
      to: '/pos',
    },
    {
      id: 'total-sourced',
      title: 'Total Milk Sourced',
      value: `${dateMetrics.totalSourced.toFixed(1)} L`,
      subtitle: `Farm: ${dateMetrics.farmYield.toFixed(0)}L · Sup: ${dateMetrics.procuredVolume.toFixed(0)}L`,
      icon: Droplets,
      color: '#2563eb',
      tag: 'Inflow',
      to: '/supplier/intake',
    },
    {
      id: 'todays-milk-sold',
      title: `Total Milk Sold${timeSuffix}`,
      value: `${Number(dateMetrics.milkSoldQty.toFixed(1))} L`,
      subtitle: `Farm: ${Number(dateMetrics.farmMilkSoldQty.toFixed(1))}L · Sup: ${Number(dateMetrics.supplierMilkSoldQty.toFixed(1))}L`,
      icon: Droplets,
      color: '#10b981',
      tag: 'Sales',
      to: '/pos',
    },
    {
      id: 'todays-milk-revenue',
      title: 'Milk Sales Revenue',
      value: `Rs. ${dateMetrics.milkSalesRevenue.toLocaleString()}`,
      subtitle: `Farm: Rs. ${dateMetrics.farmMilkRevenue.toLocaleString()} · Sup: Rs. ${dateMetrics.supplierMilkRevenue.toLocaleString()}`,
      icon: Banknote,
      color: '#059669',
      tag: 'Revenue',
      to: '/pos',
    },
    {
      id: 'todays-dahi-sold',
      title: `Dahi Sold${timeSuffix}`,
      value: `${Number(dateMetrics.dahiSoldQty.toFixed(1))} kg`,
      subtitle: `Farm + Supplier Dahi`,
      icon: Layers,
      color: '#0284c7',
      tag: 'Dahi',
      to: '/pos',
    },
    {
      id: 'todays-sales',
      title: 'Total Business Revenue',
      value: `Rs. ${dateMetrics.salesRevenue.toLocaleString()}`,
      subtitle: `${dateMetrics.orderCount} orders${isToday ? ' today' : ''}`,
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            to={card.to}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs hover:border-slate-300 group cursor-pointer"
            title={`Open ${card.title}`}
          >
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
          </Link>
        );
      })}
    </div>
  );
}
