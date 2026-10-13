import React, { useMemo } from 'react';
import { Droplets, CheckCircle2, ChevronRight, Milk, ShoppingBag, TrendingUp } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { isDateInFilterRange, getDateRangeBoundaries } from '@/utils/dateUtils';

export default function POSCardOverflow({
  onSelectSource,
  dateFilter = 'today',
  startDate = '',
  endDate = '',
}) {
  const { inventoryMetrics, salesHistory = [] } = usePOSContext();

  const { detailedLabel: periodLabel } = useMemo(() => {
    return getDateRangeBoundaries(dateFilter, startDate, endDate);
  }, [dateFilter, startDate, endDate]);

  const { milkSold, milkIncome, dahiSold, dahiIncome } = useMemo(() => {
    let mQty = 0;
    let mRev = 0;
    let dQty = 0;
    let dRev = 0;

    const filtered = salesHistory.filter((s) => {
      const raw = s.date || s.timestamp || s.formattedDate || s.createdAt || '';
      return isDateInFilterRange(raw, dateFilter, startDate, endDate);
    });

    filtered.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price) || 0));

        if (name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt')) {
          dQty += qty;
          dRev += rev;
        } else {
          mQty += qty;
          mRev += rev;
        }
      });
    });

    return {
      milkSold: parseFloat(mQty.toFixed(1)),
      milkIncome: Math.round(mRev),
      dahiSold: parseFloat(dQty.toFixed(1)),
      dahiIncome: Math.round(dRev),
    };
  }, [salesHistory, dateFilter, startDate, endDate]);

  const cards = [
    {
      id: 'total_milk',
      title: 'Total Milk Stock',
      amount: `${inventoryMetrics?.totalMilk ?? 0} L`,
      sub: `Farm: ${inventoryMetrics?.farmMilkStock ?? 0} L | Sup: ${inventoryMetrics?.supplierMilkStock ?? 0} L`,
      icon: Droplets,
      color: '#009689',
      badge: 'Milk Stock',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'dahi_stock',
      title: 'Total Dahi Stock',
      amount: `${(Number(inventoryMetrics?.totalDahiStock ?? inventoryMetrics?.totalDahi ?? 0)).toFixed(2)} kg`,
      sub: `Farm: ${(Number(inventoryMetrics?.farmDahiStock) || 0).toFixed(2)} kg | Sup: ${(Number(inventoryMetrics?.supplierDahiStock) || 0).toFixed(2)} kg`,
      icon: Milk,
      color: '#0284c7',
      badge: 'Total Dahi',
      clickable: false,
    },
    {
      id: 'milk_sold',
      title: dateFilter === 'today' ? "Today's Milk Sold" : `Milk Sold (${dateFilter.replace('_', ' ')})`,
      amount: `${milkSold} L`,
      sub: `Income: Rs. ${milkIncome.toLocaleString()}`,
      icon: CheckCircle2,
      color: '#155dfc',
      badge: dateFilter === 'today' ? 'Today Sales' : 'Sales',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'dahi_sold',
      title: dateFilter === 'today' ? "Today's Dahi Sold" : `Dahi Sold (${dateFilter.replace('_', ' ')})`,
      amount: `${dahiSold} kg`,
      sub: `Income: Rs. ${dahiIncome.toLocaleString()}`,
      icon: ShoppingBag,
      color: '#009966',
      badge: dateFilter === 'today' ? 'Today Dahi' : 'Dahi Sales',
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5">
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
