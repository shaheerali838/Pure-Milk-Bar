import { CreditCard, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Card } from '@/components/ui/card';

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

  return (
    <div className="space-y-2 mb-2.5">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Total Receivable */}
        <Card className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL RECEIVABLE
            </span>
            <div className="text-xl font-black text-slate-900 leading-tight mt-0.5 tabular">
              Rs. {totalKhataReceivable.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              All outstanding accounts
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        </Card>

        {/* 0-30 Days */}
        <Card className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              0–30 DAYS
            </span>
            <div className="text-xl font-black text-blue-600 leading-tight mt-0.5 tabular">
              Rs. {total0_30.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Current cycle dues
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </Card>

        {/* 31-90 Days */}
        <Card className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              31–90 DAYS
            </span>
            <div className="text-xl font-black text-amber-600 leading-tight mt-0.5 tabular">
              Rs. {total31_90.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Moderate aging bracket
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </Card>

        {/* 90+ Days */}
        <Card className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              90+ DAYS (HIGH RISK)
            </span>
            <div className="text-xl font-black text-rose-600 leading-tight mt-0.5 tabular">
              Rs. {total90Plus.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Critical overdue recovery
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Bucket Legend Row */}
      <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
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

