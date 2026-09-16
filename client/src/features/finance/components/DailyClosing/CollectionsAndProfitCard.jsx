import React from 'react';
import { Wallet, Banknote, Smartphone, Truck, Users, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/common/Typography';
import DailyExpensesList from './DailyExpensesList';

export default function CollectionsAndProfitCard({
  collections = {},
  expenses = {},
}) {
  const {
    counterCash = null,
    onlineTransfer = null,
    deliveryCodCash = null,
    customerKhataRecovered = null,
    totalCollections = null,
  } = collections;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '—';
    return `Rs. ${Number(val).toLocaleString()}`;
  };

  return (
    <Card className="border border-slate-200/90 shadow-sm bg-white rounded-2xl flex flex-col justify-between">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <Typography variant="h4" className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                Money Collected Today
              </Typography>
              <Typography variant="caption" color="muted">
                All cash, digital payments, and ledger recoveries collected today.
              </Typography>
            </div>
          </div>

          <Badge variant="indigo" className="text-[10px] font-bold px-2 py-0.5">
            Collections &amp; Cash
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 space-y-4 text-xs">
        {/* Group 1: Multi-Channel Collections */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <Typography variant="overline" className="text-[10px] font-extrabold text-slate-400 tracking-wider">
              1. MONEY INFLOW BY CHANNEL
            </Typography>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> Inflow Received
            </span>
          </div>

          {/* Row 1: Walk-in Counter Cash */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <div>
                <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  Counter Cash Collected
                </Typography>
                <Typography variant="caption" color="muted" className="text-[10px] block">
                  Cash paid by walk-in counter customers
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-emerald-700 tabular">
                {counterCash !== null ? `+${formatCurrency(counterCash)}` : '—'}
              </span>
            </div>
          </div>

          {/* Row 2: Walk-in Online Digital Transfer */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <div>
                <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  Digital Payments (JazzCash / EasyPaisa / Bank)
                </Typography>
                <Typography variant="caption" color="muted" className="text-[10px] block">
                  Online transfers received at register
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-blue-700 tabular">
                {onlineTransfer !== null ? `+${formatCurrency(onlineTransfer)}` : '—'}
              </span>
            </div>
          </div>

          {/* Row 3: Doorstep Delivery Cash on Delivery */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <div>
                <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  Delivery Cash on Delivery (COD)
                </Typography>
                <Typography variant="caption" color="muted" className="text-[10px] block">
                  Cash collected by riders on delivery rounds
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-indigo-700 tabular">
                {deliveryCodCash !== null ? `+${formatCurrency(deliveryCodCash)}` : '—'}
              </span>
            </div>
          </div>

          {/* Row 4: Customer Khata Dues Recovered */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                4
              </span>
              <div>
                <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  Customer Khata Dues Recovered
                </Typography>
                <Typography variant="caption" color="muted" className="text-[10px] block">
                  Past monthly Khata debts cleared today
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-purple-700 tabular">
                {customerKhataRecovered !== null ? `+${formatCurrency(customerKhataRecovered)}` : '—'}
              </span>
            </div>
          </div>

          {/* Inflow Subtotal */}
          <div className="flex items-center justify-between px-2 pt-1 font-bold text-xs text-slate-700">
            <span className="text-[11px] font-bold text-slate-600">Total Money Collected Today</span>
            <span className="font-black text-slate-900 tabular font-display">
              {formatCurrency(totalCollections)}
            </span>
          </div>
        </div>

        <Separator className="bg-slate-200/80" />

        {/* Group 2: Embedded Daily Expenses List */}
        <DailyExpensesList expenses={expenses} />
      </CardContent>
    </Card>
  );
}
