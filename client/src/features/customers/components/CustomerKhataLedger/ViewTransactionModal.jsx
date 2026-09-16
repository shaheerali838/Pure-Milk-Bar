import React from 'react';
import { X, Calendar, DollarSign, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ViewTransactionModal({ transaction, customer, isOpen, onClose }) {
  if (!isOpen || !transaction) return null;

  const isDebit = transaction.debit > 0;
  const isCredit = transaction.credit > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-display">Transaction Details</h3>
            <p className="text-[10px] text-slate-400 font-mono tabular">{transaction.id}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="text-center py-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {isDebit ? 'Amount Owed (Debit)' : isCredit ? 'Amount Paid (Credit)' : 'Balance'}
            </span>
            <div
              className={`text-2xl font-black mt-0.5 tabular ${
                isDebit ? 'text-rose-600' : isCredit ? 'text-emerald-600' : 'text-slate-800'
              }`}
            >
              Rs. {Number(transaction.debit || transaction.credit || transaction.runningBalance || 0).toLocaleString()}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Customer</span>
              <span className="font-bold text-slate-800">{customer ? customer.name : '—'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Date</span>
              <span className="font-mono text-slate-700 tabular">{transaction.date}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Description</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                {transaction.description}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Payment Mode</span>
              <span className="font-semibold text-slate-700">{transaction.method || 'Cash'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Resulting Balance</span>
              <span className="font-bold text-slate-900 tabular">
                Rs. {Number(transaction.runningBalance || 0).toLocaleString()}
              </span>
            </div>

            {transaction.notes && (
              <div className="pt-1">
                <span className="text-slate-400 font-medium block mb-0.5">Notes</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded-lg text-[11px]">
                  {transaction.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <Button
            type="button"
            onClick={onClose}
            size="sm"
            className="px-4 py-1.5 h-8 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition cursor-pointer shadow-none"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

