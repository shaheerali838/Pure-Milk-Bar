import React from 'react';
import { DollarSign, ArrowUpRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/common/Typography';

export default function DailyExpensesList({ expenses = {} }) {
  const { items = [], totalExpenses = null } = expenses;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '—';
    return `Rs. ${Number(val).toLocaleString()}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1">
        <Typography variant="overline" className="text-[10px] font-extrabold text-slate-400 tracking-wider">
          2. DAILY OPERATING EXPENSES (PAID OUT)
        </Typography>
        <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> Cash Outflows
        </span>
      </div>

      <div className="space-y-1.5">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  {index + 1}
                </span>
                <div>
                  <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs">
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="muted" className="text-[10px] block">
                    {item.note || item.category || 'Daily operating cost'}
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-rose-600 tabular">
                  {item.amount !== null && item.amount !== undefined
                    ? `-${formatCurrency(item.amount)}`
                    : '—'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <Typography variant="caption" color="muted">
              No daily expenses recorded for today yet.
            </Typography>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-2 pt-1 font-bold text-xs text-slate-700">
        <span className="text-[11px] font-bold text-slate-600">Total Expenses Paid Today</span>
        <span className="font-black text-rose-600 tabular">
          {formatCurrency(totalExpenses)}
        </span>
      </div>
    </div>
  );
}
