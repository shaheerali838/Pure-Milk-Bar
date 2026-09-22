import React from 'react';
import { Droplets, CheckCircle2, ChevronRight, Milk, ShoppingBag, TrendingUp } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSCardOverflow({ onSelectSource }) {
  const { inventoryMetrics, farmSalesMetrics } = usePOSContext();

  const cards = [
    {
      id: 'total_milk',
      title: 'Total Milk Stock',
      amount: `${inventoryMetrics?.totalMilk ?? 0} L`,
      sub: inventoryMetrics?.totalFarmYield ? `Barn Yield: ${Number(inventoryMetrics.totalFarmYield).toFixed(1)} L` : 'In Chiller Storage',
      icon: Droplets,
      color: '#009689',
      badge: 'Milk Stock',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'dahi_stock',
      title: 'Dahi Counter Stock',
      amount: `${inventoryMetrics?.totalDahi ?? 0} kg`,
      sub: `Transferred: ${inventoryMetrics?.totalDahiTransferred || 0} kg from kitchen`,
      icon: Milk,
      color: '#0284c7',
      badge: 'Dahi Stock',
      clickable: false,
    },
    {
      id: 'milk_sold',
      title: 'Total Milk Sold',
      amount: `${inventoryMetrics?.milkSold ?? 0} L`,
      sub: `Income: Rs. ${(Number(inventoryMetrics?.totalMilkPrice) || 0).toLocaleString()}`,
      icon: CheckCircle2,
      color: '#155dfc',
      badge: 'Milk Sold',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'dahi_sold',
      title: 'Dahi Sold & Revenue',
      amount: `${inventoryMetrics?.dahiSold ?? 0} kg`,
      sub: `Income: Rs. ${(Number(inventoryMetrics?.totalDahiPrice) || 0).toLocaleString()}`,
      icon: ShoppingBag,
      color: '#009966',
      badge: 'Dahi Sales',
      clickable: false,
    },
    {
      id: 'dahi_profit',
      title: 'Dahi Extra Profit',
      amount: `+Rs. ${(Number(inventoryMetrics?.dahiExtraProfit) || 0).toLocaleString()}`,
      sub: '+Rs. 60/kg value-add vs raw milk',
      icon: TrendingUp,
      color: '#10b981',
      badge: 'Extra Profit',
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
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
