import React from 'react';
import { DollarSign, ArrowUpRight, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/common/Typography';

export default function NetLiquidFlowSummary({
  financialSummary = {},
  collections = {},
  expenses = {},
}) {
  const {
    netCashLiquidFlow = null,
    grossRevenue = null,
    netEstimatedProfit = null,
  } = financialSummary;

  const { totalCollections = null, counterCash = null, deliveryCodCash = null } = collections;
  const { totalExpenses = null } = expenses;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '—';
    return `Rs. ${Number(val).toLocaleString()}`;
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white border-0 shadow-md rounded-2xl p-5 overflow-hidden relative">
      <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-800/80 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <Typography variant="overline" className="text-[10px] font-extrabold tracking-widest text-emerald-300 uppercase">
              NET LIQUID CASH FLOW TODAY
            </Typography>
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
              Cash Drawer Snapshot
            </Badge>
          </div>

          <div className="flex items-baseline gap-3">
            <Typography variant="h1" className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular font-display">
              {formatCurrency(netCashLiquidFlow)}
            </Typography>
            <span className="text-xs text-emerald-300/80 font-medium">
              Net cash in drawer after paying daily expenses
            </span>
          </div>

          <Typography variant="caption" className="text-emerald-300/60 text-xs block">
            Formula: Cash Inflow (Counter Cash + Rider COD + Khata Cash) &minus; Cash Expenses Paid
          </Typography>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-0.5">
            <span className="text-[10px] font-extrabold text-emerald-200 uppercase tracking-wider block">
              Total Inflows
            </span>
            <span className="text-sm sm:text-base font-black text-white tabular block">
              {formatCurrency(totalCollections)}
            </span>
            <span className="text-[10px] text-emerald-300/70 block">
              Cash + Digital collected
            </span>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-0.5">
            <span className="text-[10px] font-extrabold text-rose-200 uppercase tracking-wider block">
              Total Expenses
            </span>
            <span className="text-sm sm:text-base font-black text-rose-300 tabular block">
              {totalExpenses !== null ? `-${formatCurrency(totalExpenses)}` : '—'}
            </span>
            <span className="text-[10px] text-rose-200/70 block">
              Wages, feed, fuel paid
            </span>
          </div>

          <div className="p-3 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-400/30 space-y-0.5">
            <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block">
              Estimated Profit
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-200 tabular block">
              {formatCurrency(netEstimatedProfit)}
            </span>
            <span className="text-[10px] text-emerald-300/70 block">
              Net revenue margin
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
