import React from 'react';
import { Droplets, Layers, CheckCircle2, ShoppingBag, DollarSign, Tag } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSCardOverflow() {
  const { inventoryMetrics } = usePOSContext();

  const cards = [
    {
      id: 'total_milk',
      title: 'Total Milk',
      amount: `${inventoryMetrics.totalMilk} L`,
      sub: inventoryMetrics.totalFarmYield ? `Yield: ${Number(inventoryMetrics.totalFarmYield).toFixed(1)}L - ${inventoryMetrics.milkSold}L` : 'Remaining Farm Milk',
      icon: Droplets,
      color: '#009966',
      badge: 'Farm Stock',
    },
    {
      id: 'total_dahi',
      title: 'Total Dahi',
      amount: `${inventoryMetrics.totalDahi} kg`,
      sub: `Sold: ${inventoryMetrics.dahiSold} kg`,
      icon: Layers,
      color: '#f59e0b',
      badge: 'Cold Stock',
    },
    {
      id: 'milk_sold',
      title: 'Milk Sold',
      amount: `${inventoryMetrics.milkSold} L`,
      icon: CheckCircle2,
      color: '#155dfc',
      badge: 'Sales Today',
    },
    {
      id: 'dahi_sold',
      title: 'Dahi Sold',
      amount: `${inventoryMetrics.dahiSold} kg`,
      icon: ShoppingBag,
      color: '#8b5cf6',
      badge: 'Sales Today',
    },
    {
      id: 'total_milk_price',
      title: 'Total Milk Price',
      amount: `Rs. ${(Number(inventoryMetrics.totalMilkPrice) || 0).toLocaleString()}`,
      sub: `${inventoryMetrics.milkSold || 0} L bought`,
      icon: DollarSign,
      color: '#009689',
      badge: 'Milk Bought',
    },
    {
      id: 'total_dahi_price',
      title: 'Total Dahi Price',
      amount: `Rs. ${(Number(inventoryMetrics.totalDahiPrice) || 0).toLocaleString()}`,
      sub: `${inventoryMetrics.dahiSold || 0} kg bought`,
      icon: Tag,
      color: '#ec4899',
      badge: 'Dahi Bought',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all duration-200"
          style={{ borderTop: `3.5px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
              {badge}
            </span>
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
