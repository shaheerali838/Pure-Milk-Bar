import React from 'react';
import { Users, Banknote, Wallet, ArrowDownLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { KpiGridSkeleton } from '@/components/ui/skeleton';

export default function CustomerStatsCards({ onOpenAdvanceDetails }) {
  const { allCustomersCount, activeAccountsCount, isLoading } = useCustomerContext();
  const { getAllCustomersAggregates } = useLedgerContext();

  if (isLoading && (!allCustomersCount || allCustomersCount === 0)) {
    return <KpiGridSkeleton count={5} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5" />;
  }

  const aggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : {
    totalAllDue: 0,
    totalAllPaid: 0,
    totalAllCharged: 0,
    totalAllAdvanceReceived: 0,
    totalRemainingAdvance: 0,
    totalConsumedAdvance: 0,
    khataAccountsCount: 0,
    advanceAccountsCount: 0,
    totalCustomersCount: allCustomersCount || 0,
  };

  const statCards = [
    {
      id: "total_accounts",
      label: "Total Customer Accounts",
      value: `${aggregates.totalCustomersCount || allCustomersCount || 0}`,
      sub: `${activeAccountsCount || 0} active regular buyers`,
      icon: Users,
      color: "#059669", // emerald-600
      badge: "Accounts",
      clickable: false,
    },
    {
      id: "dues_accounts",
      label: "Accounts With Dues",
      value: `${aggregates.khataAccountsCount || 0}`,
      sub: "Active khata balances",
      icon: Wallet,
      color: "#d97706", // amber-600
      badge: "Pending",
      clickable: false,
    },
    {
      id: "dues_receivable",
      label: "Total Dues Receivable",
      value: `Rs. ${(aggregates.totalAllDue || 0).toLocaleString()}`,
      sub: "Total outstanding khata dues",
      icon: Banknote,
      color: "#e11d48", // rose-600
      badge: "Receivables",
      clickable: false,
    },
    {
      id: "advance_payments",
      label: "Advance Payments",
      value: `Rs. ${(aggregates.totalAllAdvanceReceived || 0).toLocaleString()}`,
      sub: `Rs. ${(aggregates.totalRemainingAdvance || 0).toLocaleString()} bal · ${aggregates.advanceAccountsCount || 0} accts`,
      icon: Sparkles,
      color: "#2563eb", // blue-600
      badge: "Advance ➔",
      badgeClass: "bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 transition-colors",
      clickable: true,
      onClick: onOpenAdvanceDetails,
      isHighlight: true,
    },
    {
      id: "total_collected",
      label: "Total Payments Received",
      value: `Rs. ${(aggregates.totalAllPaid || 0).toLocaleString()}`,
      sub: "Total collected revenue",
      icon: ArrowDownLeft,
      color: "#4f46e5", // indigo-600
      badge: "Collected",
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {statCards.map(({ id, label, value, sub, icon: Icon, color, badge, badgeClass, clickable, onClick, isHighlight }) => (
        <div
          key={id}
          onClick={clickable && onClick ? onClick : undefined}
          className={`flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs ${
            clickable
              ? 'cursor-pointer hover:border-blue-500 hover:-translate-y-0.5 ring-1 ring-blue-500/20'
              : ''
          } ${isHighlight ? 'bg-gradient-to-b from-blue-50/20 to-white' : ''}`}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                  badgeClass || 'text-slate-600 bg-slate-100 border border-slate-200/80'
                }`}
              >
                {badge}
              </span>
            </div>
          </div>

          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800">{label}</p>
              {clickable && <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            </div>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

