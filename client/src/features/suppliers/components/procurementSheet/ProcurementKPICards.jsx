import React from 'react';
import { Droplets, Banknote, TrendingUp } from 'lucide-react';

export default function ProcurementKPICards({ totals }) {
  const cards = [
    {
      id: 'total_procured',
      title: 'Procured Volume',
      amount: `${totals.totalCollected.toFixed(1)} L`,
      sub: `${totals.farmersCount} Farmers intake`,
      icon: Droplets,
      color: '#009966',
      badge: 'Intake',
    },
    {
      id: 'total_payable',
      title: 'Milk Purchases',
      amount: `Rs. ${totals.totalNetPayable.toLocaleString()}`,
      sub: 'Farmer Disbursements',
      icon: Banknote,
      color: '#d97706',
      badge: 'Khata',
    },
    {
      id: 'supplier_sales',
      title: 'Supplier POS Sales',
      amount: `Rs. ${totals.totalSupplierSales.toLocaleString()}`,
      sub: 'Resale milk + Dahi',
      icon: TrendingUp,
      color: '#009966',
      badge: 'Sales',
    },
    {
      id: 'supplier_expenses',
      title: 'Sourcing Expenses',
      amount: `Rs. ${totals.totalExpenses.toLocaleString()}`,
      sub: 'Chilling & transit',
      icon: Banknote,
      color: '#e11d48',
      badge: 'Expense',
    },
    {
      id: 'net_profit',
      title: 'Supplier Net Profit',
      amount: `${totals.daySupplierNetProfit >= 0 ? '+' : '-'} Rs. ${Math.abs(totals.daySupplierNetProfit).toLocaleString()}`,
      sub: 'Net Trading Margin',
      icon: TrendingUp,
      color: totals.daySupplierNetProfit >= 0 ? '#059669' : '#dc2626',
      badge: 'Bachat',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs"
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
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {amount}
            </p>
            <p className="text-xs font-bold text-slate-800">{title}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
