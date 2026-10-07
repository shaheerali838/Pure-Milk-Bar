import React from 'react';
import { Droplets, Layers, Milk, TrendingUp, ShoppingBag, ChevronRight, AlertCircle } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function DahiStatsCards({ metrics = {}, onSelectCard }) {
  // Pull live businessFinancialMetrics — re-renders instantly when Product Module price changes
  const { businessFinancialMetrics = {} } = usePOSContext() || {};
  const {
    totalDahiRevenue = 0,
    totalDahiProductionCost = 0,
    totalDahiNetProfit = 0,
    totalDahiSold = 0,
    dahiSalePrice = null,          // null = not set in Product Module
    isDahiPriceDefined = false,    // true only when price > 0 in Product Module
    dahiProductName = null,
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

  // ── Condition A: Price NOT defined ── show qty only, hide all revenue/profit
  // ── Condition B: Price defined      ── show qty + Rs. amount
  const dahiSalesAmount  = isDahiPriceDefined
    ? `${dahiSoldInPOS} kg  👉  +Rs. ${Number(totalDahiRevenue).toLocaleString()}`
    : `${dahiSoldInPOS} kg`;

  const dahiSalesSub     = isDahiPriceDefined
    ? `Rs. ${dahiSalePrice}/kg · ${dahiSalesOrdersCount} sale${dahiSalesOrdersCount !== 1 ? 's' : ''}`
    : `${dahiSalesOrdersCount} sale${dahiSalesOrdersCount !== 1 ? 's' : ''} · Price not set in Products`;

  const dahiProfitAmount = isDahiPriceDefined
    ? `Rs. ${Number(totalDahiNetProfit).toLocaleString()}`
    : `${dahiProduced} kg`;

  const dahiProfitTitle  = isDahiPriceDefined ? 'Dahi Net Profit' : 'Dahi Produced (Qty)';

  const dahiProfitSub    = isDahiPriceDefined
    ? `${totalDahiRevenue > 0 ? Math.round((totalDahiNetProfit / totalDahiRevenue) * 100) : 0}% Net Margin · Realized Gain`
    : 'Set sale price in Products to see revenue';

  const dahiProfitColor  = isDahiPriceDefined ? '#10b981' : '#94a3b8';

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
      title: isDahiPriceDefined ? 'POS Dahi Sales' : 'Total Dahi Available/Sold',
      amount: dahiSalesAmount,
      sub: dahiSalesSub,
      icon: ShoppingBag,
      color: isDahiPriceDefined ? '#4f39f6' : '#64748b',
      badge: isDahiPriceDefined ? 'Live Sales' : 'Qty Only',
      noPriceBadge: !isDahiPriceDefined,
    },
    {
      id: 'profit',
      title: dahiProfitTitle,
      amount: dahiProfitAmount,
      sub: dahiProfitSub,
      icon: TrendingUp,
      color: dahiProfitColor,
      badge: isDahiPriceDefined ? 'Specific P&L' : 'Pending Price',
      noPriceBadge: !isDahiPriceDefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge, noPriceBadge }) => (
        <div
          key={id}
          onClick={() => onSelectCard && onSelectCard(id)}
          role={onSelectCard ? 'button' : undefined}
          tabIndex={onSelectCard ? 0 : undefined}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
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
              {noPriceBadge && (
                <AlertCircle
                  className="w-3 h-3 text-amber-500"
                  title="Sale price not set in Product Module"
                />
              )}
              <span className="text-[10px] font-bold px-3 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
                {badge}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Value, title, and subtext */}
          <div>
            <p
              className={`font-display font-black leading-tight tracking-tight mb-0.5 tabular ${amount.length > 16 ? 'text-lg' : 'text-2xl'}`}
              style={{ color: noPriceBadge ? '#475569' : '#0f172a' }}
            >
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

