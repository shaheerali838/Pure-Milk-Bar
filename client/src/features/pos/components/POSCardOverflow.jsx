import React from 'react';
import { Droplets, CheckCircle2, ChevronRight } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSCardOverflow({ onSelectSource }) {
  const { inventoryMetrics, farmSalesMetrics } = usePOSContext();

  const cards = [
    {
      id: 'total_milk',
      title: 'Total Milk Stock',
      amount: `${inventoryMetrics?.totalMilk ?? 0} L`,
      sub: inventoryMetrics?.totalFarmYield ? `Barn Yield: ${Number(inventoryMetrics.totalFarmYield).toFixed(1)} L` : 'In Farm Chiller Storage',
      icon: Droplets,
      color: '#009689',
      badge: 'Milk Stock',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'milk_sold',
      title: 'Total Milk Sold',
      amount: `${inventoryMetrics?.milkSold ?? 0} L`,
      sub: 'Daily Counter & Delivery Sales',
      icon: CheckCircle2,
      color: '#155dfc',
      badge: 'Milk Sold',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'milk_sales_income',
      title: 'Total Milk Sale Income',
      amount: `Rs. ${(Number(inventoryMetrics?.totalMilkPrice) || 0).toLocaleString()}`,
      sub: `${inventoryMetrics?.milkSold || 0} L Total Milk Sold`,
      icon: CheckCircle2,
      color: '#4f39f6',
      badge: 'Milk Income',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'farm_sales',
      title: 'Farm Milk Sales',
      amount: `Rs. ${(farmSalesMetrics?.totalRevenue || 0).toLocaleString()}`,
      sub: `${farmSalesMetrics?.milkSold || 0} L Farm Milk Sold`,
      icon: Droplets,
      color: '#009966',
      badge: 'Farm Sales',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge, clickable, onClick }) => (
        <div
          key={id}
          onClick={clickable ? onClick : undefined}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          onKeyDown={clickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
          className={`flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 ${
            clickable
              ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] hover:border-slate-300'
              : 'hover:shadow-xs'
          }`}
          style={{ borderTop: `3.5px solid ${color}` }}
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
              {clickable && <ChevronRight className="w-3 h-3 text-slate-400" />}
            </div>
          </div>

          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {amount}
            </p>
            <p className="text-xs font-bold text-slate-800">{title}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1" title={sub}>{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
