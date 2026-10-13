import React from 'react';
import { Droplets, Layers, TrendingUp, TrendingDown, Receipt, ArrowUpRight, Users } from 'lucide-react';
import { PKRIcon } from '@/components/common/PKRIcon';

export default function PLCardOverflow({
  rawMilkRevenue = 0,
  rawMilkVolume = 0,
  rawMilkShare = 0,
  valueAddedRevenue = 0,
  valueAddedCount = 0,
  valueAddedMargin = 0,
  grossRevenue = 0,
  totalFarmCost = 0,
  expensesCount = 0,
  totalStaffSalaryPaid = 0,
  salaryPaymentsCount = 0,
  netProfit = 0,
  netMargin = 0,
  profitPerLiter = 0,
  onSelectCard,
}) {
  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  const isNetLoss = Number(netProfit) < 0;
  const isNetProfit = Number(netProfit) > 0;

  const cards = [
    {
      id: 'raw_milk',
      title: 'Raw Milk',
      amount: fmt(rawMilkRevenue),
      sub: `${Number(rawMilkVolume).toFixed(1)} L • ${rawMilkShare}% Rev`,
      icon: Droplets,
      color: '#155dfc',
      badge: 'Farm Milk',
      badgeClass: 'text-slate-600 bg-slate-100 border-slate-200/80',
      amountClass: 'text-slate-900',
    },
    {
      id: 'value_added',
      title: 'Value-Added',
      amount: fmt(valueAddedRevenue),
      sub: `${valueAddedCount} Prods • ${valueAddedMargin}% Gain`,
      icon: Layers,
      color: '#009689',
      badge: 'Processed',
      badgeClass: 'text-slate-600 bg-slate-100 border-slate-200/80',
      amountClass: 'text-slate-900',
    },
    {
      id: 'gross_revenue',
      title: 'Gross Revenue',
      amount: fmt(grossRevenue),
      sub: '3 Selling Channels',
      icon: TrendingUp,
      color: '#009966',
      badge: 'Topline',
      badgeClass: 'text-slate-600 bg-slate-100 border-slate-200/80',
      amountClass: 'text-slate-900',
    },
    {
      id: 'farm_costs',
      title: 'Farm Expenses',
      amount: fmt(totalFarmCost),
      sub: `${expensesCount} Expense Entries`,
      icon: Receipt,
      color: '#e11d48',
      badge: 'Expenses',
      badgeClass: 'text-slate-600 bg-slate-100 border-slate-200/80',
      amountClass: 'text-slate-900',
    },
    {
      id: 'net_profit',
      title: isNetLoss ? 'Net Loss' : 'Net Profit',
      amount: isNetLoss
        ? `Rs. -${Math.abs(Math.round(netProfit)).toLocaleString()}`
        : fmt(netProfit),
      sub: isNetLoss
        ? `Loss: ${Math.abs(netMargin)}% • Rs. ${Math.abs(profitPerLiter)}/L Loss`
        : isNetProfit
        ? `Margin: ${netMargin}% • Rs. ${profitPerLiter}/L`
        : 'Breakeven • Rs. 0/L',
      icon: isNetLoss ? TrendingDown : isNetProfit ? TrendingUp : PKRIcon,
      color: isNetLoss ? '#e11d48' : isNetProfit ? '#059669' : '#4f39f6',
      badge: isNetLoss ? 'Net Loss' : isNetProfit ? 'Net Profit' : 'Breakeven',
      badgeClass: isNetLoss
        ? 'text-rose-700 bg-rose-50 border-rose-200'
        : isNetProfit
        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
        : 'text-slate-600 bg-slate-100 border-slate-200/80',
      amountClass: isNetLoss ? 'text-rose-600' : isNetProfit ? 'text-emerald-700' : 'text-slate-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge, badgeClass, amountClass }) => (
        <div
          key={id}
          onClick={() => onSelectCard && onSelectCard(id)}
          className="group flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99]"
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badgeClass || 'text-slate-600 bg-slate-100 border-slate-200/80'}`}>
                {badge}
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div>
            <p className={`text-lg sm:text-xl font-black leading-tight tracking-tight mb-0.5 tabular ${amountClass || 'text-slate-900'}`}>
              {amount}
            </p>
            <p className="text-xs font-bold text-slate-800">{title}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1 mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
