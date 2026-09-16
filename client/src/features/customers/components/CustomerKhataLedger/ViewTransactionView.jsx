import React from 'react';
import { ArrowLeft, Calendar, DollarSign, FileText, CheckCircle2, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ViewTransactionView({ transaction, customer, onBack }) {
  if (!transaction) return null;

  const isDebit = Number(transaction.debit) > 0;
  const isCredit = Number(transaction.credit) > 0;
  const amount = Number(transaction.debit || transaction.credit || transaction.runningBalance || 0);

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-4">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
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
            <FileText className="w-4.5 h-4.5 text-blue-600" />
            Transaction Audit Record &bull; #{transaction.id || 'TXN-01'}
          </h1>
          <p className="text-xs text-slate-500">
            Full ledger entry details for customer: <span className="font-bold text-slate-700">{customer?.name}</span>
          </p>
        </div>
      </div>

      <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 max-w-3xl">
        <div className={`p-4 rounded-xl text-center border ${
          isDebit ? 'bg-rose-50/50 border-rose-200' : isCredit ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {isDebit ? 'Debit Amount Charged' : isCredit ? 'Credit Amount Received' : 'Balance Entry'}
          </span>
          <div className={`text-2xl font-black mt-0.5 tabular font-display ${
            isDebit ? 'text-rose-600' : isCredit ? 'text-emerald-600' : 'text-slate-900'
          }`}>
            Rs. {amount.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Name</span>
            <p className="font-bold text-slate-900 mt-0.5">{customer ? customer.name : '—'}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Date</span>
            <p className="font-bold text-slate-900 font-mono mt-0.5 tabular">{transaction.date}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Channel</span>
            <p className="font-semibold text-slate-800 mt-0.5">{transaction.method || 'Cash'}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resulting Khata Balance</span>
            <p className="font-black text-slate-900 font-mono mt-0.5 tabular">
              Rs. {Number(transaction.runningBalance || 0).toLocaleString()}
            </p>
          </div>

          <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description / Memo</span>
            <p className="font-semibold text-slate-800 mt-0.5">{transaction.description || '—'}</p>
          </div>

          {transaction.notes && (
            <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remarks &amp; Notes</span>
              <p className="text-slate-700 mt-0.5">{transaction.notes}</p>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="px-5 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
          >
            Back to Khata Ledger
          </Button>
        </div>
      </Card>
    </div>
  );
}
