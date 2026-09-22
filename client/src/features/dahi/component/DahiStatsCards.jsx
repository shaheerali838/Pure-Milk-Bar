import React from 'react';
import { Droplets, Layers, Milk, TrendingUp, ShoppingBag, ChevronRight } from 'lucide-react';

export default function DahiStatsCards({ metrics = {}, onSelectCard }) {
  const {
    totalMilkSourced = '0.0',
    farmSourced = '0',
    supplierSourced = '0',
    remainingFarmMilk,
    remainingSupplierMilk,
    remainingTotalMilk,
    convertedToDahi = '0.0',
    farmConverted = '0',
    supplierConverted = '0',
    dahiProduced = '0.0',
    conversionYield = '0.0',
    valueAddProfit = '0',
    dahiSoldInPOS = '0.0',
    dahiSalesRevenue = '0',
    dahiSalesOrdersCount = 0,
    dahiRealizedExtraProfit = '0',
    dahiPOSStock = '0.0',
    dahiTransferredToPOS = '0.0',
  } = metrics;

  const displayTotal = remainingTotalMilk !== undefined ? remainingTotalMilk : totalMilkSourced;
  const displayFarm = remainingFarmMilk !== undefined ? remainingFarmMilk : farmSourced;
  const displaySupplier = remainingSupplierMilk !== undefined ? remainingSupplierMilk : supplierSourced;

  const cards = [
    {
      id: 'sourced',
      title: 'Available Liquid Milk',
      amount: `${displayTotal} kg`,
      sub: `Farm: ${displayFarm} kg · Supplier: ${displaySupplier} kg`,
      icon: Droplets,
      color: '#155dfc',
      badge: 'Available',
    },
    {
      id: 'converted',
      title: 'Converted to Dahi',
      amount: `${convertedToDahi} kg`,
      sub: `Farm: ${farmConverted} kg · Supplier: ${supplierConverted} kg`,
      icon: Layers,
      color: '#009966',
      badge: 'Processing',
    },
    {
      id: 'dahi_stock',
      title: 'Dahi Stock at POS',
      amount: `${dahiPOSStock} kg`,
      sub: `Produced: ${dahiProduced} kg · Transferred: ${dahiTransferredToPOS} kg`,
      icon: Milk,
      color: '#0284c7',
      badge: 'POS Stock',
    },
    {
      id: 'dahi_sales',
      title: 'POS Dahi Sales',
      amount: `${dahiSoldInPOS} kg Sold`,
      sub: `Revenue: Rs. ${dahiSalesRevenue} (${dahiSalesOrdersCount} sales)`,
      icon: ShoppingBag,
      color: '#4f39f6',
      badge: 'Live Sales',
    },
    {
      id: 'profit',
      title: 'Dahi Extra Profit',
      amount: `+Rs. ${dahiRealizedExtraProfit !== '0' ? dahiRealizedExtraProfit : valueAddProfit}`,
      sub: '+Rs. 60/kg value-add vs raw milk',
      icon: TrendingUp,
      color: '#10b981',
      badge: 'Extra Profit',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
          onClick={() => onSelectCard && onSelectCard(id)}
          role={onSelectCard ? 'button' : undefined}
          tabIndex={onSelectCard ? 0 : undefined}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          style={{ borderTop: `4px solid ${color}` }}
          title={`Detailed ${title}`}
        >
          {/* Top header row: icon + badge */}
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold px-3 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
                {badge}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Value, title, and subtext */}
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {amount}
            </p>
            <p className="text-xs font-bold text-slate-700">{title}</p>
            <p className="text-[11px] font-medium text-slate-400 line-clamp-1" title={sub}>
              {sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
