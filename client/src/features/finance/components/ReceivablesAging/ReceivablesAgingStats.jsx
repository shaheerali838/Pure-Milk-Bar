import React from 'react';
import { CreditCard, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';

function computeAging(entries, customerKhataBalance) {
  const charges = (entries || [])
    .filter((e) => Number(e.debit) > 0 || e.type === 'OPENING')
    .map((e) => ({
      date: e.date,
      remaining: Number(e.debit) || Number(e.runningBalance) || 0,
    }));

  let payments = (entries || []).reduce((sum, e) => sum + (Number(e.credit) || 0), 0);

  for (const charge of charges) {
    if (payments <= 0) break;
    const applied = Math.min(charge.remaining, payments);
    charge.remaining -= applied;
    payments -= applied;
  }

  const buckets = { d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
  const today = new Date();

  charges.forEach((charge) => {
    if (charge.remaining <= 0) return;
    const ageDays = Math.floor((today - new Date(charge.date)) / (1000 * 60 * 60 * 24));
    if (ageDays <= 30) buckets.d0_30 += charge.remaining;
    else if (ageDays <= 60) buckets.d31_60 += charge.remaining;
    else if (ageDays <= 90) buckets.d61_90 += charge.remaining;
    else buckets.d90plus += charge.remaining;
  });

  const totalInBuckets = buckets.d0_30 + buckets.d31_60 + buckets.d61_90 + buckets.d90plus;
  const balance = Number(customerKhataBalance || 0);
  if (totalInBuckets !== balance && balance > 0) {
    if (totalInBuckets === 0) {
      buckets.d0_30 = balance;
    } else {
      const diff = balance - totalInBuckets;
      buckets.d0_30 = Math.max(0, buckets.d0_30 + diff);
    }
  }

  return buckets;
}

export default function ReceivablesAgingStats() {
  const { rawCustomers, totalKhataReceivable } = useCustomerContext();
  const { getLedgerForCustomer } = useLedgerContext();

  let total0_30 = 0;
  let total31_90 = 0;
  let total90Plus = 0;

  (rawCustomers || []).forEach((c) => {
    if (Number(c.khataBalance || 0) > 0) {
      const entries = getLedgerForCustomer(c.id) || [];
      const b = computeAging(entries, c.khataBalance);
      total0_30 += b.d0_30;
      total31_90 += (b.d31_60 + b.d61_90);
      total90Plus += b.d90plus;
    }
  });

  const statCards = [
    {
      label: "Total Receivable",
      value: `Rs. ${totalKhataReceivable.toLocaleString()}`,
      sub: "All outstanding accounts",
      icon: CreditCard,
      color: "#155dfc",
      badge: "Total",
    },
    {
      label: "0–30 Days",
      value: `Rs. ${total0_30.toLocaleString()}`,
      sub: "Current cycle dues",
      icon: Clock,
      color: "#009966",
      badge: "Current",
    },
    {
      label: "31–90 Days",
      value: `Rs. ${total31_90.toLocaleString()}`,
      sub: "Moderate aging bracket",
      icon: AlertTriangle,
      color: "#f59e0b",
      badge: "Overdue",
    },
    {
      label: "90+ Days (High Risk)",
      value: `Rs. ${total90Plus.toLocaleString()}`,
      sub: "Critical overdue recovery",
      icon: AlertCircle,
      color: "#e11d48",
      badge: "Critical",
    },
  ];

  return (
    <div className="space-y-2 mb-2">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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

      {/* Bucket Legend Row */}
      <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>0–30 days (Current)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <span>31–60 days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
          <span>61–90 days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          <span>90+ days (Critical)</span>
        </div>
      </div>
    </div>
  );
}
