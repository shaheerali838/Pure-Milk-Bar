import React from 'react';
import { X, Calendar, DollarSign, FileText, CheckCircle2, ArrowUpRight, ShoppingBag, Truck, Store, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeLedgerEntry } from '@/context/LedgerContext';

export default function ViewTransactionModal({ transaction: rawTxn, customer, isOpen, onClose }) {
  if (!isOpen || !rawTxn) return null;

  const txn = normalizeLedgerEntry(rawTxn);
  const isDebit = txn.debit > 0;
  const isCredit = txn.credit > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
              isDebit ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isDebit ? 'DR' : 'CR'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-display">
                {isDebit ? 'Purchase / Khata Debit Slip' : 'Payment Received Voucher'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono tabular">{txn.id || txn.invoiceId || 'N/A'}</p>
            </div>
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

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Top Amount Banner */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Order Bill</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                Rs. {Number(txn.orderTotal || txn.debit || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 block">Paid (Wasool)</span>
              <span className="text-sm font-black text-emerald-600 font-mono">
                Rs. {Number(txn.paidAmount || (isCredit ? txn.credit : 0)).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-rose-600 block">Khata Due (Baqi)</span>
              <span className="text-sm font-black text-rose-600 font-mono">
                Rs. {Number(txn.remainingAmount || (isDebit ? txn.debit : 0)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Purchased Items Breakdown */}
          {txn.items && txn.items.length > 0 && (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-slate-100/60 font-bold text-[11px] text-slate-700 flex items-center justify-between">
                <span>Items Purchased</span>
                <span className="text-[10px] text-slate-500 font-normal">{txn.items.length} item(s)</span>
              </div>
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="px-3 py-1.5 font-bold">Item Name</th>
                    <th className="px-3 py-1.5 font-bold text-center">Qty</th>
                    <th className="px-3 py-1.5 font-bold text-right">Rate</th>
                    <th className="px-3 py-1.5 font-bold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txn.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-1.5 font-medium text-slate-800">{item.name}</td>
                      <td className="px-3 py-1.5 text-center font-mono text-slate-600">
                        {item.quantity} {item.unit || ''}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-slate-600">Rs. {Number(item.rate || 0).toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900">
                        Rs. {Number(item.subtotal || item.total || (item.quantity * item.rate) || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Meta Details */}
          <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-white">
            <div className="flex justify-between items-center py-0.5 text-[11px]">
              <span className="text-slate-400 font-medium">Customer:</span>
              <span className="font-bold text-slate-800">{customer ? customer.name : '—'}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-[11px]">
              <span className="text-slate-400 font-medium">Date & Time:</span>
              <span className="font-mono text-slate-700">{txn.date} {txn.time || ''}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-[11px]">
              <span className="text-slate-400 font-medium">Order Channel:</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                {txn.fulfillmentType === 'Doorstep' || txn.fulfillmentType === 'COD' ? (
                  <>
                    <Truck className="w-3 h-3 text-indigo-500" /> Doorstep / COD Delivery
                  </>
                ) : txn.fulfillmentType === 'Walk-in' ? (
                  <>
                    <Store className="w-3 h-3 text-amber-500" /> Walk-in Counter
                  </>
                ) : (
                  <span>{txn.fulfillmentType || 'POS Order'}</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-[11px]">
              <span className="text-slate-400 font-medium">Payment Mode:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CreditCard className="w-3 h-3" /> {txn.paymentMethod || txn.method || 'Cash / Khata'}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-[11px] pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-bold">Resulting Khata Balance:</span>
              <span className="font-mono font-black text-slate-900">
                Rs. {Number(txn.runningBalance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end bg-slate-50/70">
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

