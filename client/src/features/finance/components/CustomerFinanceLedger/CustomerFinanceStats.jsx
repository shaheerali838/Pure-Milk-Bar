import React from 'react';
import { Users, CreditCard, DollarSign, Wallet } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';

export default function CustomerFinanceStats() {
  const { allCustomersCount, totalKhataReceivable, withKhataBalCount, rawCustomers } = useCustomerContext();
  const { getLedgerForCustomer } = useLedgerContext();

  // Sum all credit amounts across every customer's ledger
  const totalCollected = (rawCustomers || []).reduce((acc, cust) => {
    const entries = getLedgerForCustomer(cust.id) || [];
    return acc + entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  }, 0);

  const statCards = [
    {
      label: "Total Customers",
      value: `${allCustomersCount}`,
      sub: `${withKhataBalCount} with active debt`,
      icon: Users,
      color: "#155dfc",
      badge: "Accounts",
    },
    {
      label: "Total Outstanding Credit",
      value: `Rs. ${totalKhataReceivable.toLocaleString()}`,
      sub: "Active Khata balance pending",
      icon: CreditCard,
      color: "#e11d48",
      badge: "Receivables",
    },
    {
      label: "Total Collected",
      value: `Rs. ${totalCollected.toLocaleString()}`,
      sub: "Ledger payment inflows",
      icon: DollarSign,
      color: "#009966",
      badge: "Collected",
    },
    {
      label: "Accounts in Credit",
      value: `${withKhataBalCount}`,
      sub: "Unpaid balances pending",
      icon: Wallet,
      color: "#f59e0b",
      badge: "In Debt",
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
