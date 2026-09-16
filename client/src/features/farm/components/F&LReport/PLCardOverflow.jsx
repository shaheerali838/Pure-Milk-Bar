import React from 'react';
import { Droplets, Layers, TrendingUp, Receipt, DollarSign, ArrowUpRight } from 'lucide-react';

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
  netProfit = 0,
  netMargin = 0,
  profitPerLiter = 0,
  onSelectCard,
}) {
  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  const cards = [
    {
      id: 'raw_milk',
      title: 'Raw Milk',
      amount: fmt(rawMilkRevenue),
      sub: `${Number(rawMilkVolume).toFixed(1)} L • ${rawMilkShare}% Rev`,
      icon: Droplets,
      color: '#155dfc',
      badge: 'Farm Milk',
    },
    {
      id: 'value_added',
      title: 'Value-Added',
      amount: fmt(valueAddedRevenue),
      sub: `${valueAddedCount} Prods • ${valueAddedMargin}% Gain`,
      icon: Layers,
      color: '#009689',
      badge: 'Processed',
    },
    {
      id: 'gross_revenue',
      title: 'Gross Revenue',
      amount: fmt(grossRevenue),
      sub: '3 Selling Channels',
      icon: TrendingUp,
      color: '#009966',
      badge: 'Topline',
    },
    {
      id: 'farm_costs',
      title: 'Farm Costs',
      amount: fmt(totalFarmCost),
      sub: `${expensesCount} Farm Bills Logged`,
      icon: Receipt,
      color: '#e11d48',
      badge: 'Expenses',
    },
    {
      id: 'net_profit',
      title: 'Net Profit',
      amount: fmt(netProfit),
      sub: `Margin: ${netMargin}% • Rs. ${profitPerLiter}/L`,
      icon: DollarSign,
      color: '#4f39f6',
      badge: 'Net Profit',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
          onClick={() => onSelectCard && onSelectCard(id)}
          className="group flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99]"
          style={{ borderTop: `3.5px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                {badge}
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div>
            <p className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
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
