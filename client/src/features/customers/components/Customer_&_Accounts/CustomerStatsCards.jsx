import React from 'react';
import { Users, UserCheck, CreditCard, Wallet, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';

export default function CustomerStatsCards() {
  const { allCustomersCount, activeAccountsCount } = useCustomerContext();
  const { getAllCustomersAggregates } = useLedgerContext();

  const aggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : {
    totalAllDue: 0,
    totalAllPaid: 0,
    totalAllCharged: 0,
    khataAccountsCount: 0,
    totalCustomersCount: allCustomersCount || 0,
  };

  const statCards = [
    {
      label: "Total Customer Accounts",
      value: `${aggregates.totalCustomersCount || allCustomersCount}`,
      sub: `${activeAccountsCount} active regular buyers`,
      icon: Users,
      color: "#009966",
      badge: "All Accounts",
    },
    {
      label: "Accounts With Dues",
      value: `${aggregates.khataAccountsCount}`,
      sub: "Customers with active balance",
      icon: Wallet,
      color: "#f59e0b",
      badge: "Pending Dues",
    },
    {
      label: "Total Dues Receivable",
      value: `Rs. ${aggregates.totalAllDue.toLocaleString()}`,
      sub: "Total outstanding balance to collect",
      icon: CreditCard,
      color: "#e11d48",
      badge: "Receivables",
    },
    {
      label: "Total Payments Received",
      value: `Rs. ${aggregates.totalAllPaid.toLocaleString()}`,
      sub: "Total payments collected across all accounts",
      icon: ArrowDownLeft,
      color: "#059669",
      badge: "Collected",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all duration-200"
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
