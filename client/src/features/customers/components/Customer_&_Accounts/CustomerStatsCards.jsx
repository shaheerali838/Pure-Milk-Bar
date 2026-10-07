import React from 'react';
import { Users, CreditCard, Wallet, ArrowDownLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { KpiGridSkeleton } from '@/components/ui/skeleton';

export default function CustomerStatsCards({ onOpenAdvanceDetails }) {
  const { allCustomersCount, activeAccountsCount, isLoading, dateFilter, startDate, endDate } = useCustomerContext();
  const { getAllCustomersAggregates } = useLedgerContext();

  if (isLoading && (!allCustomersCount || allCustomersCount === 0)) {
    return <KpiGridSkeleton count={5} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5" />;
  }

  const aggregates = getAllCustomersAggregates ? getAllCustomersAggregates(dateFilter, startDate, endDate) : {
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
      label: "Total Accounts",
      value: `${aggregates.totalCustomersCount || allCustomersCount || 0} Accounts`,
      sub: `${activeAccountsCount || 0} Active Customers`,
      icon: Users,
      color: "#4f46e5",
      badge: "Network",
      clickable: false,
    },
    {
      id: "dues_accounts",
      label: "Accounts With Dues",
      value: `${aggregates.khataAccountsCount || 0} Accounts`,
      sub: "Active Balance Accounts",
      icon: Wallet,
      color: "#d97706",
      badge: "Pending",
      clickable: false,
    },
    {
      id: "dues_receivable",
      label: "Total Dues Receivable",
      value: `Rs. ${(aggregates.totalAllDue || 0).toLocaleString()}`,
      sub: "Total Khata Balance to Collect",
      icon: CreditCard,
      color: "#e11d48",
      badge: "Receivables",
      clickable: false,
    },
    {
      id: "advance_payments",
      label: "Advance Payments",
      value: `Rs. ${(aggregates.totalAllAdvanceReceived || 0).toLocaleString()}`,
      sub: `Remaining: Rs. ${(aggregates.totalRemainingAdvance || 0).toLocaleString()} · ${aggregates.advanceAccountsCount || 0} Accts`,
      icon: Sparkles,
      color: "#059669",
      badge: "Advance",
      clickable: true,
      onClick: onOpenAdvanceDetails,
    },
    {
      id: "total_collected",
      label: "Total Payments Received",
      value: `Rs. ${(aggregates.totalAllPaid || 0).toLocaleString()}`,
      sub: "Collected against Purchases & Dues",
      icon: ArrowDownLeft,
      color: "#2563eb",
      badge: "Recoveries",
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {statCards.map(({ id, label, value, sub, icon: Icon, color, badge, clickable, onClick }) => (
        <div
          key={id}
          onClick={clickable && onClick ? onClick : undefined}
          className={`flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 ${
            clickable
              ? 'cursor-pointer hover:shadow-xs hover:border-emerald-300 group'
              : 'hover:shadow-xs'
          }`}
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
              {clickable && (
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
          </div>

          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
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

