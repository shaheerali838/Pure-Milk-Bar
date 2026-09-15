import React from 'react';
import { BookOpen, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function LedgerStatsCards({
  openingBalance = 0,
  openingDate = '',
  totalCharged = 0,
  chargedCount = 0,
  totalPaid = 0,
  paidCount = 0,
  currentBalance = 0,
}) {
  const statCards = [
    {
      label: "Opening Balance",
      value: `Rs. ${Number(openingBalance || 0).toLocaleString()}`,
      sub: openingDate || "Start of period",
      icon: BookOpen,
      color: "#155dfc",
      badge: "Opening",
    },
    {
      label: "Total Charged (Milk)",
      value: `Rs. ${Number(totalCharged || 0).toLocaleString()}`,
      sub: `${chargedCount} total debits`,
      icon: TrendingUp,
      color: "#e11d48",
      badge: "Debits",
    },
    {
      label: "Total Paid",
      value: `Rs. ${Number(totalPaid || 0).toLocaleString()}`,
      sub: `${paidCount} payments recorded`,
      icon: TrendingDown,
      color: "#009966",
      badge: "Credits",
    },
    {
      label: "Current Balance (Due)",
      value: `Rs. ${Number(currentBalance || 0).toLocaleString()}`,
      sub: currentBalance > 0 ? "Pending recovery" : "All Dues Cleared",
      icon: AlertCircle,
      color: currentBalance > 0 ? "#f59e0b" : "#10b981",
      badge: currentBalance > 0 ? "Due" : "Cleared",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all duration-200"
          style={{ borderTop: `4px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span className="text-[10px] font-bold px-3 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
              {badge}
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[11px] font-medium text-slate-400">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
