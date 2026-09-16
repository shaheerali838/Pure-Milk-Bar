import React from 'react';
import { Eye, ArrowUpRight, CheckCircle2, BookOpen, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function LedgerTable({
  customer,
  ledgerEntries = [],
  totalCharged = 0,
  totalPaid = 0,
  closingBalance = 0,
  onViewCustomerProfile,
  onViewTransaction,
}) {
  const getEntryIcon = (entry) => {
    if (entry.type === 'OPENING') {
      return <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />;
    }
    if (entry.type === 'CREDIT') {
      return <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
    }
    if (entry.description && entry.description.toLowerCase().includes('sale')) {
      return <Tag className="w-3 h-3 text-rose-500 shrink-0" />;
    }
    return <ArrowUpRight className="w-3 h-3 text-rose-500 shrink-0" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden mb-3">
      <div className="px-3.5 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase leading-tight font-display">
            {customer ? `${customer.name} — KHATA LEDGER` : 'CUSTOMER KHATA LEDGER'}
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Credit Limit: Rs. {customer ? Number(customer.creditLimit || 10000).toLocaleString() : '10,000'} ·
            Delivery: {customer ? customer.subscription || '2 L Cow Milk' : '2 L Cow Milk'} ·
            Mode: {customer ? customer.paymentMode || 'Online Payment' : 'Online Payment'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {customer && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onViewCustomerProfile}
              className="flex items-center gap-1 px-2.5 py-1 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-semibold shadow-2xs transition cursor-pointer"
            >
              <Eye className="w-3 h-3 text-slate-500" />
              Customer Profile
            </Button>
          )}

          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold tabular">
            Balance Due: Rs. {Number(closingBalance || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <Table className="w-full text-left border-collapse min-w-[650px]">
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50">
              <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">DATE</TableHead>
              <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">DESCRIPTION / TRANSACTION</TableHead>
              <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">DEBIT (MILK OWED)</TableHead>
              <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">CREDIT (PAID / SETTLE)</TableHead>
              <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">RUNNING BALANCE</TableHead>
              <TableHead className="px-3.5 py-2 h-auto text-center text-slate-400 font-bold">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
            {ledgerEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-3.5 py-8 text-center text-slate-400 font-medium text-xs">
                  No ledger entries found for this customer.
                </TableCell>
              </TableRow>
            ) : (
              ledgerEntries.map((entry, idx) => (
                <TableRow
                  key={entry.id || idx}
                  onClick={() => onViewTransaction && onViewTransaction(entry)}
                  title="Click to view transaction details"
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <TableCell className="px-3.5 py-2 font-mono text-[11px] text-slate-500 whitespace-nowrap tabular">
                    {entry.date}
                  </TableCell>

                  <TableCell className="px-3.5 py-2">
                    <div className="flex items-center gap-1.5">
                      {getEntryIcon(entry)}
                      <span className={`font-semibold ${entry.type === 'OPENING' ? 'italic text-slate-500' : 'text-slate-800'}`}>
                        {entry.description}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-3.5 py-2 text-right font-bold text-rose-600 whitespace-nowrap tabular">
                    {entry.debit > 0 ? `Rs. ${Number(entry.debit).toLocaleString()}` : '—'}
                  </TableCell>

                  <TableCell className="px-3.5 py-2 text-right font-bold text-emerald-600 whitespace-nowrap tabular">
                    {entry.credit > 0 ? `Rs. ${Number(entry.credit).toLocaleString()}` : '—'}
                  </TableCell>

                  <TableCell className="px-3.5 py-2 text-right font-black text-slate-900 whitespace-nowrap tabular">
                    Rs. {Number(entry.runningBalance || 0).toLocaleString()}
                  </TableCell>

                  <TableCell className="px-3.5 py-2 text-center whitespace-nowrap">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewTransaction) onViewTransaction(entry);
                      }}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 px-2 py-0.5 h-6 rounded transition text-[11px] font-semibold cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL CHARGED
            </span>
            <span className="text-xs font-black text-rose-600 tabular">
              Rs. {Number(totalCharged || 0).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL PAID
            </span>
            <span className="text-xs font-black text-emerald-600 tabular">
              Rs. {Number(totalPaid || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            CLOSING BALANCE
          </span>
          <span className="text-base font-black text-rose-600 tabular">
            Rs. {Number(closingBalance || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

