import React from 'react';
import { BookOpen, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LedgerStatsCards({
  openingBalance = 0,
  openingDate = '',
  isAdvanceOpening = false,
  totalCharged = 0,
  chargedCount = 0,
  totalPaid = 0,
  paidCount = 0,
  currentBalance = 0,
  remainingAdvance = 0,
}) {
  const hasAdvance = isAdvanceOpening && Number(remainingAdvance || 0) > 0;
  const isCleared = !hasAdvance && Number(currentBalance || 0) <= 0;

  const statCards = [
    {
      id: 'opening',
      label: isAdvanceOpening ? 'Opening Advance Deposit' : 'Opening Balance',
      value: `Rs. ${Number(openingBalance || 0).toLocaleString()}`,
      sub: openingDate ? `Dated: ${openingDate}` : 'Period start',
      icon: BookOpen,
      color: isAdvanceOpening ? '#059669' : '#64748b',
      badge: isAdvanceOpening ? 'Advance' : 'Opening',
    },
    {
      id: 'charged',
      label: 'Total Debits (Purchases)',
      value: `Rs. ${Number(totalCharged || 0).toLocaleString()}`,
      sub: `${chargedCount} orders / purchases`,
      icon: TrendingUp,
      color: '#e11d48',
      badge: 'Debits',
    },
    {
      id: 'paid',
      label: 'Total Credits (Payments)',
      value: `Rs. ${Number(totalPaid || 0).toLocaleString()}`,
      sub: `${paidCount} deposits / payments`,
      icon: TrendingDown,
      color: '#059669',
      badge: 'Credits',
    },
    {
      id: 'balance',
      label: hasAdvance ? 'Advance Credit Remaining' : Number(currentBalance || 0) > 0 ? 'Current Balance Due' : 'Cleared Balance',
      value: `Rs. ${Number(hasAdvance ? remainingAdvance : currentBalance).toLocaleString()}`,
      sub: hasAdvance ? 'Deducted from advance' : isCleared ? 'Dues fully cleared' : 'Outstanding recovery',
      icon: isCleared ? CheckCircle2 : AlertCircle,
      color: isCleared ? '#059669' : '#e11d48',
      badge: hasAdvance ? 'Advance Bal' : isCleared ? 'Cleared' : 'Balance Due',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2.5">
      {statCards.map(({ id, label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs"
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
            </div>
          </div>

          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular font-display">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-800">{label}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
