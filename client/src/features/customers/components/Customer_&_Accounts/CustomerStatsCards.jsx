import React from 'react';
import { Users, CreditCard, Wallet, ArrowDownLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { KpiGridSkeleton } from '@/components/ui/skeleton';

export default function CustomerStatsCards({ onOpenAdvanceDetails }) {
  const { allCustomersCount, activeAccountsCount, isLoading } = useCustomerContext();
  const { getAllCustomersAggregates } = useLedgerContext();

  if (isLoading && (!allCustomersCount || allCustomersCount === 0)) {
    return <KpiGridSkeleton count={5} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2" />;
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
      color: "#009966",
      badge: "All Accounts",
      clickable: false,
    },
    {
      id: "dues_accounts",
      label: "Accounts With Dues",
      value: `${aggregates.khataAccountsCount || 0}`,
      sub: "Customers with active balance",
      icon: Wallet,
      color: "#f59e0b",
      badge: "Pending Dues",
      clickable: false,
    },
    {
      id: "dues_receivable",
      label: "Total Dues Receivable",
      value: `Rs. ${(aggregates.totalAllDue || 0).toLocaleString()}`,
      sub: "Total outstanding balance to collect",
      icon: CreditCard,
      color: "#e11d48",
      badge: "Receivables",
      clickable: false,
    },
    {
      id: "advance_payments",
      label: "Advance Payments",
      value: `Rs. ${(aggregates.totalAllAdvanceReceived || 0).toLocaleString()}`,
      sub: `Rs. ${(aggregates.totalRemainingAdvance || 0).toLocaleString()} remaining • ${aggregates.advanceAccountsCount || 0} accounts`,
      icon: Sparkles,
      color: "#059669",
      badge: "Advance • View Details ➔",
      badgeClass: "bg-emerald-500 text-white font-extrabold shadow-xs hover:bg-emerald-600 transition-colors",
      clickable: true,
      onClick: onOpenAdvanceDetails,
      isHighlight: true,
    },
    {
      id: "total_collected",
      label: "Total Payments Received",
      value: `Rs. ${(aggregates.totalAllPaid || 0).toLocaleString()}`,
      sub: "Earned payments collected against purchases & dues",
      icon: ArrowDownLeft,
      color: "#2563eb",
      badge: "Collected",
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
      {statCards.map(({ id, label, value, sub, icon: Icon, color, badge, badgeClass, clickable, onClick, isHighlight }) => (
        <div
          key={id}
          onClick={clickable && onClick ? onClick : undefined}
          className={`compact-surface flex flex-col justify-between bg-white border rounded-lg p-2 transition-all duration-200 ${
            clickable
              ? 'cursor-pointer hover:shadow-md hover:border-emerald-500 hover:-translate-y-0.5 ring-1 ring-emerald-500/20'
              : 'border-slate-200/90 hover:shadow-xs'
          } ${isHighlight ? 'bg-linear-to-b from-emerald-50/30 to-white border-emerald-300/80' : ''}`}
        >
          <div className="flex items-start justify-between mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span
              className={`compact-chip text-[10px] font-bold rounded ${
                badgeClass || 'text-slate-600 bg-slate-100 border border-slate-200'
              }`}
            >
              {badge}
            </span>
          </div>
          <div>
            <p className={`font-display text-lg sm:text-xl font-black leading-tight tracking-tight mb-0.5 tabular ${
              isHighlight ? 'text-emerald-800' : 'text-slate-900'
            }`}>
              {value}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">{label}</p>
              {clickable && <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            </div>
            <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

