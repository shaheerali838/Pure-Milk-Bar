import React from 'react';
import { Users, CreditCard, Banknote, Wallet, Sparkles, ChevronRight } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';

export default function CustomerFinanceStats({ onOpenAdvanceDetails }) {
  const { allCustomersCount, totalKhataReceivable, withKhataBalCount, rawCustomers, customers } = useCustomerContext();
  const { getAllCustomersAggregates } = useLedgerContext();

  const aggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : null;
  const effectiveTotalDue = (aggregates && aggregates.totalAllDue > 0)
    ? aggregates.totalAllDue
    : totalKhataReceivable;
  const effectiveKhataCount = (aggregates && aggregates.khataAccountsCount > 0)
    ? aggregates.khataAccountsCount
    : withKhataBalCount;

  // Realized revenue collected against purchases & regular repayments (excludes unconsumed advance deposits)
  const totalCollected = Number(aggregates?.totalAllPaid || 0);
  const totalAdvanceHeld = Number(aggregates?.totalAllAdvanceReceived || 0);
  const remainingAdvance = Number(aggregates?.totalRemainingAdvance || 0);
  const advanceAccountsCount = Number(aggregates?.advanceAccountsCount || 0);

  const statCards = [
    {
      id: "total_customers",
      label: "Total Customers",
      value: `${allCustomersCount || (rawCustomers || []).length || 0}`,
      sub: `${effectiveKhataCount} with active dues`,
      icon: Users,
      color: "#155dfc",
      badge: "Accounts",
      clickable: false,
    },
    {
      id: "outstanding_dues",
      label: "Total Outstanding Dues",
      value: `Rs. ${Number(effectiveTotalDue).toLocaleString()}`,
      sub: "Active Khata balance pending to recover",
      icon: CreditCard,
      color: "#e11d48",
      badge: "Receivables",
      clickable: false,
    },
    {
      id: "advance_deposits",
      label: "Advance Deposits Held",
      value: `Rs. ${totalAdvanceHeld.toLocaleString()}`,
      sub: `Rs. ${remainingAdvance.toLocaleString()} remaining • ${advanceAccountsCount} accounts`,
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
      label: "Total Collected",
      value: `Rs. ${totalCollected.toLocaleString()}`,
      sub: "Realized sales & bill collections",
      icon: Banknote,
      color: "#009966",
      badge: "Earned Revenue",
      clickable: false,
    },
    {
      id: "accounts_in_debt",
      label: "Accounts in Debt",
      value: `${effectiveKhataCount}`,
      sub: "Unpaid dues pending",
      icon: Wallet,
      color: "#f59e0b",
      badge: "In Debt",
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 mb-2.5">
      {statCards.map(({ id, label, value, sub, icon: Icon, color, badge, badgeClass, clickable, onClick, isHighlight }) => (
        <div
          key={id}
          onClick={clickable && onClick ? onClick : undefined}
          className={`flex flex-col justify-between bg-white border rounded-2xl p-3 shadow-xs transition-all duration-200 ${
            clickable
              ? 'cursor-pointer hover:shadow-md hover:border-emerald-500 hover:-translate-y-0.5 ring-1 ring-emerald-500/20'
              : 'border-slate-200/90 hover:shadow-xs'
          } ${isHighlight ? 'bg-linear-to-b from-emerald-50/30 to-white border-emerald-300/80' : ''}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                badgeClass || 'text-slate-600 bg-slate-100 border border-slate-200'
              }`}
            >
              {badge}
            </span>
          </div>
          <div>
            <p className={`font-display text-xl sm:text-2xl font-black leading-tight tracking-tight mb-0.5 tabular ${
              isHighlight ? 'text-emerald-800' : 'text-slate-900'
            }`}>
              {value}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">{label}</p>
              {clickable && <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
