import React, { useMemo } from 'react';
import { useExpense } from '../../../../context/ExpenseContext';
import { DollarSign, Tractor, Wrench, Utensils } from 'lucide-react';

export default function ExpenseFarmCardOverFlow({ expenses: propExpenses }) {
  const { totals: globalTotals } = useExpense();

  const activeTotals = useMemo(() => {
    if (!propExpenses) return globalTotals;

    let totalFarmExpense = 0;
    let feedSeedFarming = 0;
    let fuelTransportRepairs = 0;
    let salariesKitchenMess = 0;

    propExpenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      const scope = String(exp.scope || exp.expenseEntity || 'FARM').toUpperCase();
      const cat = String(exp.category || '').toUpperCase();

      if (scope === 'FARM') {
        totalFarmExpense += amt;
        if (
          cat.includes('FEED') ||
          cat.includes('SEED') ||
          cat.includes('VETERINARY') ||
          cat.includes('LIVESTOCK') ||
          cat.includes('DAIRY')
        ) {
          feedSeedFarming += amt;
        } else if (
          cat.includes('FUEL') ||
          cat.includes('MACHINERY') ||
          cat.includes('ELECTRICITY') ||
          cat.includes('SHED') ||
          cat.includes('HARDWARE') ||
          cat.includes('TRANSPORT') ||
          cat.includes('MAINTENANCE') ||
          cat.includes('UTILITIES')
        ) {
          fuelTransportRepairs += amt;
        } else if (cat.includes('SALAR') || cat.includes('KITCHEN') || cat.includes('WAGE') || cat.includes('LABOUR') || cat.includes('LABOR')) {
          salariesKitchenMess += amt;
        }
      }
    });

    return {
      totalFarmExpense,
      feedSeedFarming,
      fuelTransportRepairs,
      salariesKitchenMess,
    };
  }, [propExpenses, globalTotals]);

  const statCards = [
    {
      label: "Total Farm Expense",
      value: `Rs. ${activeTotals.totalFarmExpense.toLocaleString()}`,
      sub: "Total expenses recorded",
      icon: DollarSign,
      color: "#009966",
      badge: "Total Expenses"
    },
    {
      label: "Feed, Seed & Farming",
      value: `Rs. ${activeTotals.feedSeedFarming.toLocaleString()}`,
      sub: "Farming supplies & feed",
      icon: Tractor,
      color: "#155dfc",
      badge: "Category: Feed"
    },
    {
      label: "Fuel, Transport & Repairs",
      value: `Rs. ${activeTotals.fuelTransportRepairs.toLocaleString()}`,
      sub: "Vehicle & maintenance",
      icon: Wrench,
      color: "#009689",
      badge: "Category: Fuel"
    },
    {
      label: "Salaries & Kitchen Mess",
      value: `Rs. ${activeTotals.salariesKitchenMess.toLocaleString()}`,
      sub: "Staff & food costs",
      icon: Utensils,
      color: "#10b981",
      badge: "Category: Salaries"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2 shadow-sm hover:shadow-md transition-all duration-200"
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
