import React from 'react';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  User,
  CreditCard,
  ShoppingBag,
  Store,
  Truck,
  Banknote,
  Receipt,
  Tag,
  Package,
} from 'lucide-react';
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
import { normalizeLedgerEntry } from '@/context/LedgerContext';

export default function ViewTransactionView({ transaction: rawTxn, customer, onBack }) {
  if (!rawTxn) return null;

  const transaction = normalizeLedgerEntry(rawTxn) || rawTxn;
  const isOpening = transaction.isOpening || transaction.type === 'OPENING' || /opening/i.test(transaction.description || '');
  const isAdvanceOpening =
    isOpening &&
    (Number(transaction.credit) > 0 ||
      transaction.fulfillmentType === 'Advance Deposit' ||
      String(customer?.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
      customer?.openingPaymentMethod === 'CASH' ||
      customer?.openingPaymentMethod === 'ONLINE' ||
      /advance/i.test(transaction.description || ''));

  const rawOpeningVal = Number(
    transaction.credit ||
    transaction.debit ||
    transaction.orderTotal ||
    transaction.paidAmount ||
    customer?.openingBalance ||
    0
  );

  const displayOrderTotal = isAdvanceOpening
    ? rawOpeningVal
    : Number(transaction.orderTotal || transaction.debit || transaction.credit || 0);

  const displayPaidAmount = isAdvanceOpening
    ? rawOpeningVal
    : Number(transaction.paidAmount || (Number(transaction.credit) > 0 ? transaction.credit : 0));

  const displayBalanceDue = isAdvanceOpening
    ? 0
    : Number(transaction.remainingAmount || (Number(transaction.debit) > 0 ? Number(transaction.debit) - Number(transaction.paidAmount || 0) : 0));

  const isDebit = Number(transaction.debit) > 0 && !isAdvanceOpening;
  const isCredit = (Number(transaction.credit) > 0 || isAdvanceOpening);
  const hasItems = Array.isArray(transaction.items) && transaction.items.length > 0;

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
            <Receipt className="w-4.5 h-4.5 text-emerald-600" />
            {isAdvanceOpening
              ? 'Advance Deposit Audit Spec'
              : isOpening
              ? 'Opening Balance Audit Spec'
              : 'Transaction Audit Spec'} &bull; #{transaction.invoiceId || transaction.id || 'TXN-01'}
          </h1>
          <p className="text-xs text-slate-500">
            {isAdvanceOpening
              ? 'Customer initial advance payment deposit statement for: '
              : isOpening
              ? 'Customer account opening balance statement for: '
              : 'Full Khata audit & purchase ledger record for: '}
            <span className="font-bold text-slate-700">{customer?.name}</span>
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 max-w-4xl">
        <Card className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {isAdvanceOpening ? 'Advance Deposit' : 'Total Order Bill'}
          </span>
          <div className="text-base font-black text-slate-900 tabular font-display mt-0.5">
            Rs. {displayOrderTotal.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            {isAdvanceOpening ? 'Amount Received' : 'Amount Paid'}
          </span>
          <div className="text-base font-black text-emerald-700 tabular font-display mt-0.5">
            Rs. {displayPaidAmount.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Balance Due
          </span>
          <div className="text-base font-black text-rose-600 tabular font-display mt-0.5">
            Rs. {displayBalanceDue.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            Total Customer Balance
          </span>
          <div className="text-base font-black text-slate-900 tabular font-display mt-0.5">
            Rs. {Number(customer?.currentBalance !== undefined ? customer.currentBalance : (transaction.runningBalance || 0)).toLocaleString()}
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 max-w-4xl">
        {/* Purchased Items Table if present */}
        {hasItems && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span>Items Purchased on POS / Order</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <Table className="w-full text-xs">
                <TableHeader>
                  <TableRow className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase">
                    <TableHead className="py-2 px-3 text-left">Product / Item</TableHead>
                    <TableHead className="py-2 px-3 text-center">Quantity</TableHead>
                    <TableHead className="py-2 px-3 text-right">Unit Rate (PKR)</TableHead>
                    <TableHead className="py-2 px-3 text-right">Subtotal (PKR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {transaction.items.map((item, i) => {
                    const unitRate = Number(item.unitPrice || item.price || item.rate || (item.quantity > 0 && item.subtotal ? item.subtotal / item.quantity : 0));
                    return (
                      <TableRow key={i} className="hover:bg-slate-50/50">
                        <TableCell className="py-2 px-3 font-bold text-slate-900">
                          {item.name}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-center text-slate-700 font-semibold tabular">
                          {item.quantity} {item.unit || ''}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right text-slate-600 tabular">
                          Rs. {unitRate.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right font-bold text-emerald-800 tabular">
                          Rs. {Number(item.subtotal || item.quantity * unitRate).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Name
            </span>
            <p className="font-bold text-slate-900 mt-0.5">{customer ? customer.name : '—'}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Transaction Date
            </span>
            <p className="font-bold text-slate-900 font-mono mt-0.5 tabular">{transaction.date}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Fulfillment Mode
            </span>
            <p className="font-bold text-blue-700 mt-0.5">{isAdvanceOpening ? 'Advance Deposit' : (transaction.fulfillmentType || 'Walk-in Counter')}</p>
          </div>

          {transaction.riderName && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                Delivery Rider / Staff
              </span>
              <p className="font-bold text-indigo-900 mt-0.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                {transaction.riderName}
              </p>
            </div>
          )}

          {transaction.cashierName && (
            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Processed By (Cashier)
              </span>
              <p className="font-bold text-slate-800 mt-0.5">{transaction.cashierName}</p>
            </div>
          )}

          {transaction.deliveryAddress && (
            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Delivery Address / Area
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">{transaction.deliveryAddress}</p>
            </div>
          )}

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Payment Method / Channel
            </span>
            <p className="font-semibold text-purple-700 mt-0.5">
              {isAdvanceOpening
                ? (transaction.paymentMethod?.includes('ONLINE') ? 'Advance Online Deposit' : 'Advance Cash Deposit')
                : (transaction.paymentMethod || 'Cash')}
            </p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Payment Status
            </span>
            <p className="font-bold text-emerald-700 mt-0.5">
              {isAdvanceOpening ? 'Paid in Full (Advance Deposit)' : (transaction.paymentStatus || 'Processed')}
            </p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Resulting Khata Balance
            </span>
            <p className="font-black text-slate-900 font-mono mt-0.5 tabular">
              Rs. {Number(customer?.currentBalance !== undefined ? customer.currentBalance : (transaction.runningBalance || 0)).toLocaleString()}
            </p>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Description / Memo
            </span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {isAdvanceOpening
                ? 'Customer Initial Advance Cash Deposit (Paid in advance)'
                : (transaction.description || '—')}
            </p>
          </div>

          {transaction.notes && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Remarks &amp; Notes
              </span>
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
            className="px-5 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl cursor-pointer"
          >
            Back to Khata Ledger
          </Button>
        </div>
      </Card>
    </div>
  );
}
