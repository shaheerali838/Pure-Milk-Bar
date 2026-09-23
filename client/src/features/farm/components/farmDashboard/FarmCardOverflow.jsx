import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, Droplets, Activity, DollarSign, IndianRupee } from 'lucide-react';
import { useExpense } from '../../../../context/ExpenseContext';
import { usePOSContext } from '../../../../context/POSContext';

export default function FarmCardOverflow({ 
  totalAnimals = 0, 
  cowsCount = 0, 
  buffCount = 0, 
  totalFarmYield = 0, 
  avgAnimalYield = 0, 
  dailyNetProfit = 0, 
  monthlyNetProfit = 0 
}) {
  const navigate = useNavigate();
  const { totals, expenses = [] } = useExpense();
  const posCtx = usePOSContext?.();
  const farmMilkStock = posCtx?.inventoryMetrics?.farmMilkStock ?? (totalFarmYield > 0 ? totalFarmYield.toFixed(1) : '0');
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
      value: `PKR ${totalFarmExpense.toLocaleString()}`,
      sub: `${expenses.length} recorded expense${expenses.length === 1 ? '' : 's'}`,
      icon: IndianRupee,
      color: "#e11d48",
      badge: "Expenses",
      path: "/farm/expenses"
    },
    {
      label: "Farm Net Profit",
      value: `Rs. ${dailyNetProfit.toLocaleString()}`,
      sub:  "Rs.  month net ",
      icon: DollarSign,
      color: "#10b981",
      badge: "Net Profit / Day",
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
          style={{ borderTop: `4px solid ${color}` }}
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
