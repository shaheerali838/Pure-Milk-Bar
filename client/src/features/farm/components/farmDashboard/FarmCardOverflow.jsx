import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, Droplets, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { PKRIcon } from '@/components/common/PKRIcon';
import { useExpense } from '../../../../context/ExpenseContext';
import { usePOSContext } from '../../../../context/POSContext';

export default function FarmCardOverflow({ 
  totalAnimals = 0, 
  cowsCount = 0, 
  buffCount = 0, 
  totalFarmYield = 0, 
  availableFarmStock = null,
  avgAnimalYield = 0, 
  dailyNetProfit = 0, 
  monthlyNetProfit = 0,
  todayFarmRevenue = 0,
}) {
  const navigate = useNavigate();
  const { totals, expenses = [] } = useExpense();
  const posCtx = usePOSContext?.();
  
  // Resilient calculation for Available Farm Stock (Cold room / Chiller):
  // Formula: Available Farm Stock = Total Farm Intake - (Total Farm Milk Sold in POS + Total Farm Milk Converted to Dahi)
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
  const totalFarmExpense = totals?.totalFarmExpense ?? 0;

  const statCards = [
    {
      label: "Total Animals",
      value: `${totalAnimals}`,
      sub: `${cowsCount} Cows • ${buffCount} Buffaloes`,
      icon: Beef,
      color: "#009966",
      badge: "Active Herd",
      path: "/farm/animals"
    },
    {
      label: "Total Farm Yield",
      value: `${totalFarmYield.toFixed(1)} L`,
      sub: "Daily total production",
      icon: Droplets,
      color: "#155dfc",
      badge: "Today's Milk",
      path: "/farm/milking"
    },
    {
      label: "Available Farm Stock",
      value: `${farmMilkStock} L`,
      sub: "In farm cold room",
      icon: Droplets,
      color: "#059669",
      badge: "Chiller Stock",
      path: "/pos"
    },
    {
      label: "Average Animal Yield",
      value: `${avgAnimalYield.toFixed(1)} L`,
      sub: "Avg output per animal",
      icon: Activity,
      color: "#009689",
      badge: "Yield / Head"
    },
    {
      label: "Total Farm Expenses",
      value: `Rs. ${totalFarmExpense.toLocaleString()}`,
      sub: `${expenses.length} recorded expense${expenses.length === 1 ? '' : 's'}`,
      icon: PKRIcon,
      color: "#e11d48",
      badge: "Expenses",
      path: "/farm/expenses"
    },
    {
      label: dailyNetProfit < 0 ? "Farm Net Loss (Today)" : "Farm Net Profit (Today)",
      value: dailyNetProfit < 0
        ? `-Rs. ${Math.abs(dailyNetProfit).toLocaleString()}`
        : `Rs. ${dailyNetProfit.toLocaleString()}`,
      sub: dailyNetProfit < 0
        ? `Today expenses exceed sales by Rs. ${Math.abs(dailyNetProfit).toLocaleString()}`
        : dailyNetProfit > 0
        ? `From Rs. ${todayFarmRevenue.toLocaleString()} today sales`
        : "Today: Breakeven / No sales yet",
      icon: dailyNetProfit < 0 ? TrendingDown : dailyNetProfit > 0 ? TrendingUp : PKRIcon,
      color: dailyNetProfit < 0 ? "#e11d48" : dailyNetProfit > 0 ? "#10b981" : "#64748b",
      badge: dailyNetProfit < 0 ? "Today Loss" : dailyNetProfit > 0 ? "Today Profit" : "Today Net",
      path: "/farm/pl"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge, path }) => (
        <div
          key={label}
          onClick={() => path && navigate(path)}
          className={`flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2 shadow-sm hover:shadow-md transition-all duration-200 ${
            path ? 'cursor-pointer' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span className="text-[10px] font-bold px-6 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
              {badge}
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[11px] font-medium text-slate-400">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
