import React from 'react';
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Truck,
  Scale,
  Milk,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';

export default function SupplierPLCards({ summaryData, onSelectCard }) {
  if (!summaryData) return null;

  const cards = [
    {
      id: 'income',
      title: 'Total Sourced Income',
      value: `Rs. ${Number(summaryData.income || 0).toLocaleString()}`,
      subtext: `${summaryData.totalVolume ? Number(summaryData.totalVolume).toLocaleString() : 0} L Resale Volume`,
      badge: summaryData.avgResalePerLiter ? `Avg Rs. ${Math.round(summaryData.avgResalePerLiter)}/L` : 'Realized Income',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: DollarSign,
      iconColor: 'bg-emerald-100 text-emerald-700',
      borderHover: 'hover:border-emerald-300',
    },
    {
      id: 'cost',
      title: 'Supplier Purchase Cost',
      value: `Rs. ${Number(summaryData.cost || 0).toLocaleString()}`,
      subtext: `Direct Milk Intake Spend`,
      badge: `Avg Rs. ${Number(summaryData.avgPurchaseRate || 0).toFixed(1)}/L`,
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: Receipt,
      iconColor: 'bg-rose-100 text-rose-700',
      borderHover: 'hover:border-rose-300',
    },
    {
      id: 'gross',
      title: 'Trading Gross Profit',
      value: `Rs. ${Number(summaryData.gross || 0).toLocaleString()}`,
      subtext: `Spread Before Overheads`,
      badge: `${summaryData.grossMarginPercent || 0}% Gross`,
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: TrendingUp,
      iconColor: 'bg-blue-100 text-blue-700',
      borderHover: 'hover:border-blue-300',
    },
    {
      id: 'logistics',
      title: 'Logistics & Testing',
      value: `Rs. ${Number(summaryData.logistics || 0).toLocaleString()}`,
      subtext: `Transit, Fuel & Chilling`,
      badge: `${summaryData.expenseVouchersCount || 0} Vouchers`,
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: Truck,
      iconColor: 'bg-amber-100 text-amber-700',
      borderHover: 'hover:border-amber-300',
    },
    {
      id: 'net',
      title: 'Total Net Profit',
      value: `Rs. ${Number(summaryData.net || 0).toLocaleString()}`,
      subtext: `Bottom-Line Trading Gain`,
      badge: `${summaryData.netMarginPercent || 0}% Net`,
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      icon: Scale,
      iconColor: 'bg-indigo-100 text-indigo-700',
      borderHover: 'hover:border-indigo-300',
    },
    {
      id: 'realization',
      title: 'Realization / Liter',
      value: `Rs. ${Number(summaryData.realizationPerLiter || 0).toFixed(2)}`,
      subtext: `Net Realized Per Liter`,
      badge: `Spread / L`,
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      icon: Milk,
      iconColor: 'bg-purple-100 text-purple-700',
      borderHover: 'hover:border-purple-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const colorHex = card.iconColor.includes('emerald') ? '#059669' :
                         card.iconColor.includes('rose') ? '#e11d48' :
                         card.iconColor.includes('blue') ? '#2563eb' :
                         card.iconColor.includes('amber') ? '#d97706' : 
                         card.iconColor.includes('indigo') ? '#4f46e5' : 
                         card.iconColor.includes('purple') ? '#9333ea' : '#64748b';

        return (
          <div
            key={card.id}
            onClick={() => onSelectCard && onSelectCard(card.id)}
            role="button"
            tabIndex={0}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] hover:border-slate-300"
            style={{ borderTop: `3.5px solid ${colorHex}` }}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${card.iconColor}`}
              >
                <Icon className="w-[15px] h-[15px]" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                  {card.badge}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div>
              <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
                {card.value}
              </p>
              <p className="text-xs font-bold text-slate-800">{card.title}</p>
              <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
