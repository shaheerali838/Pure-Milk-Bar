import React from 'react';
import { BookOpen, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LedgerStatsCards({
  openingBalance = 0,
  openingDate = '',
  totalCharged = 0,
  chargedCount = 0,
  totalPaid = 0,
  paidCount = 0,
  currentBalance = 0,
}) {
  const isCleared = currentBalance <= 0;

  const statCards = [
    {
      label: 'Opening Balance',
      value: `PKR ${Number(openingBalance || 0).toLocaleString()}`,
      sub: openingDate ? `Dated: ${openingDate}` : 'Period start',
      icon: BookOpen,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      badge: 'Opening',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/60',
    },
    {
      label: 'Total Debits',
      value: `PKR ${Number(totalCharged || 0).toLocaleString()}`,
      sub: `${chargedCount} orders / debits`,
      icon: TrendingUp,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      badge: 'Debits',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/60',
    },
    {
      label: 'Total Credits',
      value: `PKR ${Number(totalPaid || 0).toLocaleString()}`,
      sub: `${paidCount} payments received`,
      icon: TrendingDown,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      badge: 'Credits',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    },
    {
      label: 'Cleared Balance',
      value: `PKR ${Number(currentBalance || 0).toLocaleString()}`,
      sub: isCleared ? 'Dues fully cleared' : 'Outstanding recovery',
      icon: isCleared ? CheckCircle2 : AlertCircle,
      iconColor: isCleared ? 'text-emerald-600' : 'text-amber-600',
      iconBg: isCleared ? 'bg-emerald-50' : 'bg-amber-50',
      badge: isCleared ? 'Cleared' : 'Pending',
      badgeClass: isCleared
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
        : 'bg-amber-50 text-amber-700 border-amber-200/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {statCards.map(({ label, value, sub, icon: Icon, iconColor, iconBg, badge, badgeClass }) => (
        <Card
          key={label}
          className="bg-white border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors h-20"
        >
          <CardContent className="p-3 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 truncate">
                {label}
              </span>
              <div className={`w-6 h-6 rounded-md ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-1">
              <div className="text-lg font-bold font-mono text-slate-900 tracking-tight tabular">
                {value}
              </div>
              <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${badgeClass}`}>
                {badge}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
