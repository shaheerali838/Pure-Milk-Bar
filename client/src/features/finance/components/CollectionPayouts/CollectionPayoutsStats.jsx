import React from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';

export default function CollectionPayoutsStats() {
  const { totalKhataReceivable, rawCustomers } = useCustomerContext();
  const { ledgers } = useLedgerContext();

  const today = new Date().toISOString().split('T')[0];

  // Flat collection rows
  let totalRecoveredToday = 0;
  let pendingClearance = 0;
  let collectionsRecorded = 0;

  (rawCustomers || []).forEach((customer) => {
    const entries = ledgers[String(customer.id)] || [];
    entries.forEach((entry) => {
      const credit = Number(entry.credit) || 0;
      if (credit > 0) {
        collectionsRecorded += 1;
        if (entry.date === today) {
          totalRecoveredToday += credit;
        }
        if (entry.method === 'Bank' || entry.method === 'Bank Transfer') {
          pendingClearance += credit;
        }
      }
    });
  });

  const statCards = [
    {
      label: "Total Recovered Today",
      value: `Rs. ${totalRecoveredToday.toLocaleString()}`,
      sub: "Direct Khata cash & online",
      icon: DollarSign,
      color: "#009966",
      badge: "Today's Recovery",
    },
    {
      label: "Outstanding Khata Dues",
      value: `Rs. ${totalKhataReceivable.toLocaleString()}`,
      sub: "Receivables from customers",
      icon: CreditCard,
      color: "#e11d48",
      badge: "Pending",
    },
    {
      label: "Pending Clearance",
      value: `Rs. ${pendingClearance.toLocaleString()}`,
      sub: "Unconfirmed vouchers / bank",
      icon: Clock,
      color: "#f59e0b",
      badge: "Verification",
    },
    {
      label: "Collections Recorded",
      value: `${collectionsRecorded}`,
      sub: "Receipt transactions total",
      icon: CheckCircle2,
      color: "#155dfc",
      badge: "Receipts",
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
