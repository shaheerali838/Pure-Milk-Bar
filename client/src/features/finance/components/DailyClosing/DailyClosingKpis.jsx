import React from 'react';
import { Milk, ShoppingBag, Banknote, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DailyClosingKpis({
  milkExpected = 0,
  isMilkNegative = false,
  totalSales = 0,
  moneyCollected = 0,
  estimatedProfit = 0,
  isClosed = false,
}) {
  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-PK')}`;
  const formatL = (val) => `${Number(val || 0).toLocaleString('en-PK', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} L`;

  const kpiData = [
    {
      id: 'milk',
      label: 'Milk in Tanks',
      sublabel: isMilkNegative ? 'Warning: Negative Balance' : 'Theoretical Stock',
      value: formatL(milkExpected),
      icon: Milk,
      color: isMilkNegative ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400',
      bgColor: isMilkNegative ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-sky-50 dark:bg-sky-950/40',
      borderColor: isMilkNegative ? 'border-rose-300 dark:border-rose-800' : 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'sales',
      label: 'Total Sales (Gross)',
      sublabel: 'Counter + Deliveries',
      value: formatRs(totalSales),
      icon: ShoppingBag,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'collected',
      label: 'Money Collected',
      sublabel: 'Cash + Digital + Khata',
      value: formatRs(moneyCollected),
      icon: Banknote,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'profit',
      label: 'Estimated Day Profit',
      sublabel: 'Revenue - COGS - Expenses',
      value: formatRs(estimatedProfit),
      icon: TrendingUp,
      color: estimatedProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400',
      bgColor: estimatedProfit >= 0 ? 'bg-teal-50 dark:bg-teal-950/40' : 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpiData.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`bg-white dark:bg-slate-900 border ${item.borderColor} rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {item.label}
              </span>
              <div className={`p-2 rounded-xl ${item.bgColor} ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-2">
              <div className={`text-xl sm:text-2xl font-black tracking-tight ${item.color}`}>
                {item.value}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                {item.id === 'milk' && isMilkNegative && (
                  <AlertTriangle className="w-3 h-3 text-rose-500 inline" />
                )}
                <span>{item.sublabel}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
