import React from 'react';
import { ArrowLeft, Phone, MapPin, DollarSign, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CustomerFinanceDetailView({ customer, onBack, onRecordPayment }) {
  const { getLedgerForCustomer } = useLedgerContext();

  if (!customer) return null;

  const entries = getLedgerForCustomer(customer.id) || [];
  const outstanding = Math.max(0, Number(customer?.khataBalance || 0));
  const totalPaid = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';
  const custCode = `CUST-${String(customer.id).slice(-4)}`;

  const lastTxn = entries.length > 0 ? entries[entries.length - 1] : null;
  const lastTxnDate = lastTxn ? lastTxn.date : (customer.createdAt || new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
              Customer Financial Ledger &bull; {customer.name}
            </h1>
            <p className="text-xs text-slate-500">
              Account ID: <span className="font-mono font-semibold tabular">{custCode}</span> &bull; Area: {customer.area || 'Model Town'}
            </p>
          </div>
        </div>

        {onRecordPayment && (
          <Button
            type="button"
            onClick={() => onRecordPayment(customer)}
            size="sm"
            className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Record Payment
          </Button>
        )}
      </div>

      {/* Hero Balance Card */}
      <Card className="bg-[#0b1b1a] p-4 sm:p-5 rounded-2xl text-white border-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0d3b36] text-[#2dd4bf] font-extrabold flex items-center justify-center text-xl shrink-0 border border-[#134e48] font-display">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white leading-tight font-display">{customer.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#134e48] text-emerald-300 border border-[#0d3b36]">
                  {customer.status || 'Active'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1 font-mono tabular">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {customer.phone}
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {customer.address || customer.area || 'Model Town'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              KHATA BALANCE DUE (PKR)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#ff6b81] tracking-tight mt-0.5 font-mono tabular">
              Rs. {outstanding.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* 3 Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Card className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            TOTAL PAID TO DATE
          </span>
          <div className="text-lg font-black text-emerald-950 mt-1 font-mono tabular">
            Rs. {totalPaid.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            OUTSTANDING CREDIT DUE
          </span>
          <div className="text-lg font-black text-rose-900 mt-1 font-mono tabular">
            Rs. {outstanding.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
            LAST TRANSACTION DATE
          </span>
          <div className="text-lg font-black text-indigo-950 mt-1 font-mono tabular">
            {lastTxnDate}
          </div>
        </Card>
      </div>

      {/* Transaction History Section */}
      <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
            Financial Transaction History &amp; Ledgers
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {entries.length} records found
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <Table className="w-full text-left border-collapse text-xs">
            <TableHeader className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <TableRow className="hover:bg-slate-50">
                <TableHead className="px-3.5 py-2.5 h-auto text-slate-400 font-bold">DATE &amp; REF</TableHead>
                <TableHead className="px-3.5 py-2.5 h-auto text-slate-400 font-bold">TYPE</TableHead>
                <TableHead className="px-3.5 py-2.5 h-auto text-right text-slate-400 font-bold">TOTAL DUE</TableHead>
                <TableHead className="px-3.5 py-2.5 h-auto text-right text-slate-400 font-bold">AMOUNT PAID</TableHead>
                <TableHead className="px-3.5 py-2.5 h-auto text-right text-slate-400 font-bold">REMAINING</TableHead>
                <TableHead className="px-3.5 py-2.5 h-auto text-center text-slate-400 font-bold">STATUS</TableHead>
                <TableHead className="px-3.5 py-2.5 h-auto text-slate-400 font-bold">METHOD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-slate-700">
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-3.5 py-8 text-center text-slate-400">
                    No transaction records found for this customer.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry, idx) => {
                  const refCode = entry.ref || (entry.id ? `TXN-${String(entry.id).slice(-4)}` : `TXN-${1000 + idx}`);
                  const credit = Number(entry.credit) || 0;
                  const debit = Number(entry.debit) || 0;
                  const runningBal = Number(entry.runningBalance) || 0;
                  const totalDueBefore = runningBal + credit;

                  let typeLabel = 'Custom Amount';
                  if (entry.type === 'OPENING') typeLabel = 'Opening Balance';
                  else if (credit > 0 && runningBal === 0) typeLabel = 'Full Payment';
                  else if (credit > 0 && totalDueBefore > 0 && Math.abs(credit - Math.round(totalDueBefore / 2)) < 5) typeLabel = 'Half Payment (50%)';
                  else if (credit > 0) typeLabel = 'Partial Payment';
                  else if (debit > 0) typeLabel = 'Debit Charge';

                  const isPaid = credit > 0 && runningBal === 0;
                  const isPartial = credit > 0 && runningBal > 0;

                  return (
                    <TableRow key={entry.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="font-mono text-slate-800 font-semibold text-[11px] tabular">{entry.date}</div>
                        <div className="text-[10px] font-mono text-blue-600 font-bold tabular">{refCode}</div>
                      </TableCell>

                      <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                          {typeLabel}
                        </span>
                      </TableCell>

                      <TableCell className="px-3.5 py-2.5 text-right font-medium text-slate-800 whitespace-nowrap font-mono tabular">
                        Rs. {totalDueBefore > 0 ? totalDueBefore.toLocaleString() : (debit > 0 ? debit.toLocaleString() : '—')}
                      </TableCell>

                      <TableCell className="px-3.5 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap font-mono tabular">
                        {credit > 0 ? `Rs. ${credit.toLocaleString()}` : '—'}
                      </TableCell>

                      <TableCell className="px-3.5 py-2.5 text-right font-bold text-[#ff4d6d] whitespace-nowrap font-mono tabular">
                        Rs. {runningBal.toLocaleString()}
                      </TableCell>

                      <TableCell className="px-3.5 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isPartial
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending'}
                        </span>
                      </TableCell>

                      <TableCell className="px-3.5 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                        {entry.method || 'Cash'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
