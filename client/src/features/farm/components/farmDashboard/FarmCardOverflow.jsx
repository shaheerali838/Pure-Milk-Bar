import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, Droplets, Activity, TrendingUp, TrendingDown, ChevronRight, Banknote } from 'lucide-react';
import { usePOSContext } from '../../../../context/POSContext';

export default function FarmCardOverflow({ 
  totalAnimals = 0, 
  cowsCount = 0, 
  buffCount = 0, 
  totalFarmYield = 0, 
  totalExpectedYield = 0,
  availableFarmStock = null,
  avgAnimalYield = 0, 
  dailyNetProfit = 0, 
  totalFarmExpense = 0,
  todayFarmRevenue = 0,
  periodFarmExpense,
  expenseCount = 0,
  timeRange = 'today',
  dateFilter,
  periodLabel,
}) {
  const navigate = useNavigate();
  const posCtx = usePOSContext?.();
  
  // Resilient calculation for Available Farm Stock (Cold room / Chiller):
  const parsedPropStock = availableFarmStock !== null && availableFarmStock !== undefined ? parseFloat(availableFarmStock) : NaN;
  const parsedPosStock = parseFloat(
    posCtx?.inventoryMetrics?.availableFarmStock ??
    posCtx?.inventoryMetrics?.rawAvailableFarmStock ??
    posCtx?.inventoryMetrics?.farmMilkStock ??
    posCtx?.inventoryMetrics?.rawFarmMilkStock
  );

  let effectiveStock = 0;
  if (!isNaN(parsedPropStock) && parsedPropStock >= 0) {
    effectiveStock = Math.max(0, parsedPropStock);
  } else if (!isNaN(parsedPosStock) && parsedPosStock >= 0) {
    effectiveStock = Math.max(0, parsedPosStock);
  } else {
    const farmSold = Number(posCtx?.farmSalesMetrics?.milkSold) || 0;
    effectiveStock = Math.max(0, totalFarmYield - farmSold);
  }

  const farmMilkStock = effectiveStock % 1 === 0 ? effectiveStock.toFixed(0) : effectiveStock.toFixed(1);
  const activeDateFilter = dateFilter || timeRange || 'today';
  const resolvedPeriodLabel = periodLabel || (activeDateFilter === 'today' ? 'Today' : activeDateFilter === 'week' || activeDateFilter === 'this_week' ? 'This Week' : activeDateFilter === 'month' || activeDateFilter === 'this_month' ? 'This Month' : 'All Time');
  const effectiveExpense = periodFarmExpense !== undefined ? periodFarmExpense : totalFarmExpense;

  const statCards = [
    {
      label: "Total Animals",
      value: `${totalAnimals}`,
      sub: `${cowsCount} Cows · ${buffCount} Buffaloes`,
      icon: Beef,
      color: "#009966",
      badge: "Herd",
      path: "/farm/animals"
    },
    {
      label: `Total Farm Yield (${resolvedPeriodLabel})`.trim(),
      value: `${totalFarmYield.toFixed(1)} L`,
      sub: totalExpectedYield > 0
        ? `Exp: ${totalExpectedYield.toFixed(1)} L (${totalFarmYield >= totalExpectedYield ? '+' : ''}${(totalFarmYield - totalExpectedYield).toFixed(1)} L)`
        : (activeDateFilter === 'today' ? "Daily total production" : `${resolvedPeriodLabel} production`),
      icon: Droplets,
      color: "#2563eb",
      badge: activeDateFilter === 'today' ? "Today's Milk" : "Farm Milk",
      path: "/farm/milking"
    },
    {
      label: "Available Stock (With Me)",
      value: `${farmMilkStock} L`,
      sub: Number(posCtx?.inventoryMetrics?.totalMilk) > Number(farmMilkStock)
        ? `Farm Chiller · Total: ${posCtx?.inventoryMetrics?.totalMilk} L`
        : "In Cold Room Chiller",
      icon: Droplets,
      color: "#059669",
      badge: "Available",
      path: "/pos"
    },
    {
      label: "Average Animal Yield",
      value: `${avgAnimalYield.toFixed(1)} L`,
      sub: totalExpectedYield > 0 && totalAnimals > 0
        ? `Benchmark: ${(totalExpectedYield / totalAnimals).toFixed(1)} L/head`
        : "Avg Output Per Head",
      icon: Activity,
      color: "#4f46e5",
      badge: "Yield / Head",
      path: "/farm/animals"
    },
    {
      label: `Farm Expenses (${resolvedPeriodLabel})`.trim(),
      value: `Rs. ${effectiveExpense.toLocaleString()}`,
      sub: expenseCount ? `${expenseCount} recorded expenses` : `${resolvedPeriodLabel} farm expenses`,
      icon: Banknote,
      color: "#e11d48",
      badge: "Expenses",
      path: "/farm/expenses"
    },
    {
      label: dailyNetProfit < 0 ? `Farm Net Loss (${resolvedPeriodLabel})` : `Farm Net Profit (${resolvedPeriodLabel})`,
      value: dailyNetProfit < 0
        ? `Rs. -${Math.abs(dailyNetProfit).toLocaleString()}`
        : `Rs. ${dailyNetProfit.toLocaleString()}`,
      sub: dailyNetProfit < 0
        ? `${resolvedPeriodLabel} expenses exceed sales by Rs. ${Math.abs(dailyNetProfit).toLocaleString()}`
        : dailyNetProfit > 0
        ? `From Rs. ${Number(todayFarmRevenue || posCtx?.farmSalesMetrics?.revenue || 0).toLocaleString()} sales`
        : `${resolvedPeriodLabel}: Breakeven / No sales`,
      icon: dailyNetProfit < 0 ? TrendingDown : dailyNetProfit > 0 ? TrendingUp : Banknote,
      color: dailyNetProfit < 0 ? "#e11d48" : dailyNetProfit > 0 ? "#10b981" : "#64748b",
      badge: dailyNetProfit < 0 ? "Loss" : dailyNetProfit > 0 ? "Profit" : "Net",
      path: "/farm/pl"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge, path }) => (
        <div
          key={label}
          onClick={() => path && navigate(path)}
          role={path ? 'button' : undefined}
          tabIndex={path ? 0 : undefined}
          className={`flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs ${
            path ? 'cursor-pointer hover:border-slate-300' : ''
          }`}
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
              {path && <ChevronRight className="w-2.5 h-2.5 text-slate-300" />}
            </div>
          </div>

          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-800 line-clamp-1">{label}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
