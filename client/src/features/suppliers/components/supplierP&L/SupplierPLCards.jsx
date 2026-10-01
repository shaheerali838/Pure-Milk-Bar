import React from 'react';
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Droplets,
  Scale,
  Milk,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';

export default function SupplierPLCards({ summaryData, onSelectCard }) {
  if (!summaryData) return null;

  const cards = [
    {
      id: 'cost',
      title: 'Total Procurement Cost',
      value: `Rs. ${Number(summaryData.cost || 0).toLocaleString()}`,
      subtext: `Direct Milk Intake Spend`,
      badge: `Avg Rs. ${Number(summaryData.avgPurchaseRate || 0).toFixed(1)}/L`,
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: Receipt,
      iconColor: 'bg-rose-100 text-rose-700',
      borderHover: 'hover:border-rose-300',
    },
    {
      id: 'volume',
      title: 'Total Procured Volume',
      value: `${Number(summaryData.totalVolume || 0).toLocaleString()} L`,
      subtext: `${summaryData.intakeRecords?.length || 0} Intake Records`,
      badge: `${summaryData.buffaloVolume || 0}L Buffalo Procured`,
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: Droplets,
      iconColor: 'bg-blue-100 text-blue-700',
      borderHover: 'hover:border-blue-300',
    },
    {
      id: 'paid',
      title: 'Total Paid (Settled)',
      value: `Rs. ${Number(summaryData.paidSpend || 0).toLocaleString()}`,
      subtext: `Settled with Suppliers`,
      badge: summaryData.cost > 0 && summaryData.paidSpend >= summaryData.cost ? 'Fully Settled' : 'Payment Disbursed',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: DollarSign,
      iconColor: 'bg-emerald-100 text-emerald-700',
      borderHover: 'hover:border-emerald-300',
    },
    {
      id: 'due',
      title: 'Supplier Balance Due',
      value: `Rs. ${Number(summaryData.pendingSpend || 0).toLocaleString()}`,
      subtext: `Payable Khata Balance`,
      badge: summaryData.pendingSpend > 0 ? 'Pending Settlement' : 'Clear Balance',
      badgeColor: summaryData.pendingSpend > 0 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-50 border-slate-200',
      icon: Scale,
      iconColor: 'bg-amber-100 text-amber-700',
      borderHover: 'hover:border-amber-300',
    },
    {
      id: 'expenses',
      title: 'Sourcing Expenses',
      value: `Rs. ${Number(summaryData.logistics || 0).toLocaleString()}`,
      subtext: `${summaryData.expenseVouchersCount || 0} Expense Vouchers`,
      badge: `Total Overhead`,
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: Receipt,
      iconColor: 'bg-amber-100 text-amber-700',
      borderHover: 'hover:border-amber-300',
    },
    {
      id: 'income',
      title: 'Realized Sales Revenue',
      value: `Rs. ${Number(summaryData.income || 0).toLocaleString()}`,
      subtext: `${summaryData.realSoldVolume || 0} L Sold via POS`,
      badge: summaryData.income > 0 ? `${summaryData.grossMarginPercent || 0}% Margin` : 'Real POS Sales',
      badgeColor: 'text-teal-700 bg-teal-50 border-teal-200',
      icon: TrendingUp,
      iconColor: 'bg-teal-100 text-teal-700',
      borderHover: 'hover:border-teal-300',
    },
    {
      id: 'net',
      title: 'Net Profit / Loss (Bachat)',
      value: `${summaryData.net >= 0 ? '+' : '-'} Rs. ${Math.abs(summaryData.net || 0).toLocaleString()}`,
      subtext: `${summaryData.realSoldVolume || 0} L Sold • ${summaryData.grossMarginPercent || 0}% Bachat`,
      badge: `Profit (Bachat)`,
      badgeColor: summaryData.net >= 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200',
      icon: TrendingUp,
      iconColor: summaryData.net >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
      borderHover: summaryData.net >= 0 ? 'hover:border-emerald-300' : 'hover:border-rose-300',
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
          >
            <div className="flex items-start justify-between mb-1.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${card.iconColor}`}
              >
                <Icon className="w-3.75 h-3.75" />
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
