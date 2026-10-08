import React from 'react';
import { Droplets, Layers, Milk, TrendingUp, ShoppingBag, ChevronRight, AlertCircle } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function DahiStatsCards({ metrics = {}, onSelectCard }) {
  const { businessFinancialMetrics = {} } = usePOSContext() || {};
  const {
    totalDahiRevenue = 0,
    totalDahiNetProfit = 0,
    dahiSalePrice = null,
    isDahiPriceDefined = false,
  } = businessFinancialMetrics;

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
    dahiSoldInPOS = '0.0',
    dahiSalesOrdersCount = 0,
    dahiPOSStock = '0.0',
    dahiTransferredToPOS = '0.0',
  } = metrics;

  const displayTotal    = remainingTotalMilk    !== undefined ? remainingTotalMilk    : totalMilkSourced;
  const displayFarm     = remainingFarmMilk     !== undefined ? remainingFarmMilk     : farmSourced;
  const displaySupplier = remainingSupplierMilk !== undefined ? remainingSupplierMilk : supplierSourced;

  const dahiSalesAmount = isDahiPriceDefined
    ? `${dahiSoldInPOS} kg · Rs. ${Number(totalDahiRevenue).toLocaleString()}`
    : `${dahiSoldInPOS} kg`;

  const dahiSalesSub = isDahiPriceDefined
    ? `Rs. ${dahiSalePrice}/kg · ${dahiSalesOrdersCount} sales`
    : `${dahiSalesOrdersCount} sales · Rate not set`;

  const dahiProfitAmount = isDahiPriceDefined
    ? `Rs. ${Number(totalDahiNetProfit).toLocaleString()}`
    : `${dahiProduced} kg`;

  const dahiProfitTitle = isDahiPriceDefined ? 'Dahi Net Profit' : 'Dahi Produced';
  const dahiProfitSub   = isDahiPriceDefined
    ? `${totalDahiRevenue > 0 ? Math.round((totalDahiNetProfit / totalDahiRevenue) * 100) : 0}% Net Margin`
    : 'Pending price in Products';

  const dahiProfitColor = isDahiPriceDefined ? '#059669' : '#94a3b8';

  const cards = [
    {
      id: 'sourced',
      title: 'Available Liquid Milk (With Me)',
      amount: `${displayTotal} kg`,
      sub: `Farm: ${displayFarm}kg · Sup: ${displaySupplier}kg`,
      icon: Droplets,
      color: '#155dfc',
      badge: 'Available',
    },
    {
      id: 'converted',
      title: 'Converted to Dahi',
      amount: `${convertedToDahi} kg`,
      sub: `Farm: ${farmConverted}kg · Sup: ${supplierConverted}kg`,
      icon: Layers,
      color: '#009966',
      badge: 'Processing',
    },
    {
      id: 'dahi_stock',
      title: 'Dahi Stock (With Me)',
      amount: `${dahiPOSStock} kg`,
      sub: `Ready: ${dahiProduced}kg · POS: ${dahiTransferredToPOS}kg`,
      icon: Milk,
      color: '#0284c7',
      badge: 'Stock',
    },
    {
      id: 'dahi_sales',
      title: isDahiPriceDefined ? 'POS Dahi Sales' : 'Total Dahi Sold',
      amount: dahiSalesAmount,
      sub: dahiSalesSub,
      icon: ShoppingBag,
      color: isDahiPriceDefined ? '#4f46e5' : '#64748b',
      badge: isDahiPriceDefined ? 'Sales' : 'Qty',
      noPriceBadge: !isDahiPriceDefined,
    },
    {
      id: 'profit',
      title: dahiProfitTitle,
      amount: dahiProfitAmount,
      sub: dahiProfitSub,
      icon: TrendingUp,
      color: dahiProfitColor,
      badge: isDahiPriceDefined ? 'Profit' : 'Output',
      noPriceBadge: !isDahiPriceDefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge, noPriceBadge }) => (
        <div
          key={id}
          onClick={() => onSelectCard && onSelectCard(id)}
          role={onSelectCard ? 'button' : undefined}
          tabIndex={onSelectCard ? 0 : undefined}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs hover:border-slate-300 cursor-pointer"
          title={`Detailed ${title}`}
        >
          {/* Top header row: icon + badge */}
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <div className="flex items-center gap-1">
              {noPriceBadge && (
                <AlertCircle
                  className="w-3 h-3 text-amber-500 shrink-0"
                  title="Sale price not set in Product Module"
                />
              )}
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                {badge}
              </span>
              <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
            </div>
          </div>

          {/* Value, title, and subtext */}
          <div>
            <p
              className="text-lg font-black leading-tight tracking-tight mb-0.5 tabular font-display"
              style={{ color: noPriceBadge ? '#475569' : '#0f172a' }}
            >
              {amount}
            </p>
            <p className="text-xs font-bold text-slate-800 line-clamp-1">{title}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1" title={sub}>
              {sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
