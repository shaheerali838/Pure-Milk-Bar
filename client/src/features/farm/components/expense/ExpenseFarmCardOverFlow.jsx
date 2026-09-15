import React from 'react';
import { useExpense } from '../../../../context/ExpenseContext';
import { IndianRupee, Tractor, Wrench, Utensils } from 'lucide-react';

export default function ExpenseFarmCardOverFlow() {
  const { totals } = useExpense();

  const statCards = [
    {
      label: "Total Farm Expense",
      value: `PKR ${totals.totalFarmExpense.toLocaleString()}`,
      sub: "Total expenses recorded",
      icon: IndianRupee,
      color: "#009966",
      badge: "Total Expenses"
    },
    {
      label: "Feed, Seed & Farming",
      value: `PKR ${totals.feedSeedFarming.toLocaleString()}`,
      sub: "Farming supplies & feed",
      icon: Tractor,
      color: "#155dfc",
      badge: "Category: Feed"
    },
    {
      label: "Fuel, Transport & Repairs",
      value: `PKR ${totals.fuelTransportRepairs.toLocaleString()}`,
      sub: "Vehicle & maintenance",
      icon: Wrench,
      color: "#009689",
      badge: "Category: Fuel"
    },
    {
      label: "Salaries & Kitchen Mess",
      value: `PKR ${totals.salariesKitchenMess.toLocaleString()}`,
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
