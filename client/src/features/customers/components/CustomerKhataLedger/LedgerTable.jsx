import React from 'react';
import {
  Eye,
  CheckCircle2,
  BookOpen,
  Tag,
  ShoppingBag,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export default function LedgerTable({
  customer,
  ledgerEntries = [],
  totalCharged = 0,
  totalPaid = 0,
  closingBalance = 0,
  onViewCustomerProfile,
  onViewTransaction,
}) {
  const getProductEmoji = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('cow')) return '🥛';
    if (lower.includes('buffalo')) return '🥛';
    if (lower.includes('dahi') || lower.includes('yogurt')) return '🥣';
    if (lower.includes('paneer') || lower.includes('cheese')) return '🧀';
    if (lower.includes('butter') || lower.includes('makhan')) return '🧈';
    if (lower.includes('khoya') || lower.includes('mawa')) return '🍯';
    if (lower.includes('lassi')) return '🧃';
    return '📦';
  };

  const getFulfillmentBadge = (type = '') => {
    const lower = type.toLowerCase();
    if (lower.includes('walk-in') || lower.includes('counter') || lower.includes('store')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 text-[10px] font-semibold">
          <Store className="w-3 h-3" /> Walk-in Counter
        </span>
      );
    }
    if (lower.includes('cod')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-[10px] font-semibold">
          <Truck className="w-3 h-3" /> Doorstep (COD)
        </span>
      );
    }
    if (lower.includes('doorstep') || lower.includes('delivery')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-[10px] font-semibold">
          <Truck className="w-3 h-3" /> Doorstep Delivery
        </span>
      );
    }
    if (lower.includes('opening')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
          <BookOpen className="w-3 h-3" /> Opening Balance
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
        {type || 'Direct Entry'}
      </span>
    );
  };

  const getPaymentBadge = (method = '') => {
    const lower = method.toLowerCase();
    if (lower.includes('online') || lower.includes('easypaisa') || lower.includes('jazzcash') || lower.includes('bank')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70 text-[10px] font-semibold">
          <CreditCard className="w-3 h-3" /> Online Payment
        </span>
      );
    }
    if (lower.includes('cod')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-[10px] font-semibold">
          <Banknote className="w-3 h-3" /> Cash On Delivery
        </span>
      );
    }
    if (lower.includes('cash')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-semibold">
          <Banknote className="w-3 h-3" /> Cash Paid
        </span>
      );
    }
    if (lower.includes('khata') || lower.includes('credit')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 text-[10px] font-semibold">
          <Tag className="w-3 h-3" /> Khata Credit
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-semibold">
        {method || 'Cash'}
      </span>
    );
  };

  return (
    <Card className="bg-white border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Header Section */}
      <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight font-display">
            {customer ? `${customer.name} — Khata Statement` : 'Khata Statement'}
          </h2>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
            {ledgerEntries.length} Records
          </span>
        </div>

        <div className="flex items-center gap-2">
          {customer && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onViewCustomerProfile}
              className="h-6.5 px-2 text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer gap-1 rounded-md"
            >
              <Eye className="w-3 h-3 text-slate-400" />
              <span>Profile</span>
            </Button>
          )}

          <div
            className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold font-mono tabular flex items-center gap-1 shadow-2xs ${
              closingBalance > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span className="text-[10px] font-normal text-slate-500">Due:</span>
            <span>PKR {Number(closingBalance || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full text-left border-collapse min-w-[920px]">
          <TableHeader>
            <TableRow className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-50/80">
              <TableHead className="px-3 py-1.5 h-auto text-slate-600 font-bold w-[120px]">DATE &amp; REF</TableHead>
              <TableHead className="px-3 py-1.5 h-auto text-slate-600 font-bold min-w-[220px]">
                PURCHASED ITEMS &amp; DETAILS
              </TableHead>
              <TableHead className="px-3 py-1.5 h-auto text-slate-600 font-bold w-[160px]">
                CHANNEL
              </TableHead>
              <TableHead className="px-3 py-1.5 h-auto text-right text-slate-600 font-bold w-[110px]">
                TOTAL BILL
              </TableHead>
              <TableHead className="px-3 py-1.5 h-auto text-right text-slate-600 font-bold w-[110px]">
                PAID (WASOOL)
              </TableHead>
              <TableHead className="px-3 py-1.5 h-auto text-right text-slate-600 font-bold w-[130px]">
                REMAINING (BAQI)
              </TableHead>
              <TableHead className="px-3 py-1.5 h-auto text-right text-slate-600 font-bold w-[110px]">
                BALANCE
              </TableHead>
              <TableHead className="px-3 py-1.5 h-auto text-center text-slate-600 font-bold w-[70px]">
                VIEW
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
            {ledgerEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-3 py-8 text-center text-slate-400 font-medium text-xs">
                  <ShoppingBag className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  No purchase or Khata ledger transactions found.
                </TableCell>
              </TableRow>
            ) : (
              ledgerEntries.map((rawEntry, idx) => {
                const entry = normalizeLedgerEntry(rawEntry) || rawEntry;
                const isCreditOnly = Number(entry.credit) > 0 && Number(entry.debit) === 0;
                const isOpening = entry.type === 'OPENING';
                const hasItems = Array.isArray(entry.items) && entry.items.length > 0;

                return (
                  <TableRow
                    key={entry.id || idx}
                    onClick={() => onViewTransaction && onViewTransaction(entry)}
                    title="Click to view full transaction invoice & audit record"
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* 1. Date & Invoice / Ref */}
                    <TableCell className="px-3 py-2 whitespace-nowrap align-top">
                      <div className="font-bold text-slate-900 text-[11px] leading-tight">
                        {entry.date}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 leading-tight mt-0.5">
                        {entry.invoiceId || entry.id || `TXN-#${idx + 1}`}
                      </div>
                      {entry.cashierName && (
                        <div className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-1 inline-block">
                          By: {entry.cashierName}
                        </div>
                      )}
                    </TableCell>

                    {/* 2. Purchased Items & Rates */}
                    <TableCell className="px-3 py-2 align-top">
                      {isOpening ? (
                        <div className="flex items-center gap-1 text-slate-600 font-medium italic text-[11px]">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Initial Opening Balance</span>
                        </div>
                      ) : isCreditOnly ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-bold text-emerald-800 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Payment Received (ادائیگی موصول): PKR {Number(entry.credit).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Wasool: PKR {Number(entry.credit).toLocaleString()}
                            </span>
                            {Number(entry.runningBalance) > 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Abhi Baqi: PKR {Number(entry.runningBalance).toLocaleString()}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Khata Cleared (مکمل صاف)
                              </span>
                            )}
                          </div>
                          {entry.notes && (
                            <p className="text-[10px] text-slate-500 line-clamp-1">{entry.notes}</p>
                          )}
                        </div>
                      ) : hasItems ? (
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {entry.items.map((item, itemIdx) => {
                              const unitPrice = Number(item.unitPrice || item.price || 0);
                              const subtotal = Number(item.subtotal || item.total || (unitPrice > 0 ? unitPrice * item.quantity : 0));
                              return (
                                <span
                                  key={itemIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100/90 border border-slate-200/80 rounded-md text-[10px] font-medium text-slate-800"
                                >
                                  <span>{getProductEmoji(item.name)}</span>
                                  <span className="font-bold text-slate-900">{item.name}</span>
                                  <span className="text-emerald-700 font-black">({item.quantity} {item.unit || 'Unit'})</span>
                                  {unitPrice > 0 && (
                                    <span className="text-slate-500 font-medium">@Rs.{unitPrice}</span>
                                  )}
                                  {subtotal > 0 && (
                                    <span className="text-slate-900 font-bold bg-white px-1 py-0.2 rounded border border-slate-200">
                                      = Rs.{subtotal.toLocaleString()}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                          {entry.notes && (
                            <p className="text-[10px] text-slate-500 italic line-clamp-1">{entry.notes}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800 text-[11px] block">
                            {entry.description}
                          </span>
                          {entry.notes && (
                            <p className="text-[10px] text-slate-500 line-clamp-1">{entry.notes}</p>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* 3. Order Channel & Delivery Person / Rider */}
                    <TableCell className="px-3 py-2 whitespace-nowrap align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          {getFulfillmentBadge(entry.fulfillmentType)}
                        </div>
                        {entry.riderName ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50/80 border border-indigo-200 text-indigo-800 text-[10px] font-bold">
                            <Truck className="w-3 h-3 text-indigo-600" />
                            <span>Rider: {entry.riderName}</span>
                          </div>
                        ) : entry.fulfillmentType?.toLowerCase().includes('walk') || entry.fulfillmentType?.toLowerCase().includes('counter') ? (
                          <div className="text-[9px] text-slate-500 flex items-center gap-1">
                            <Store className="w-2.5 h-2.5 text-slate-400" /> Direct Counter Sale
                          </div>
                        ) : null}
                        {entry.deliveryAddress && (
                          <div className="text-[9px] text-slate-500 max-w-[150px] truncate" title={entry.deliveryAddress}>
                            📍 {entry.deliveryAddress}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* 4. Payment Method */}
                    <TableCell className="px-3 py-2 whitespace-nowrap align-top">
                      <div className="pt-0.5">
                        {getPaymentBadge(entry.paymentMethod)}
                      </div>
                    </TableCell>

                    {/* 5. Total Order Bill */}
                    <TableCell className="px-3 py-2 text-right whitespace-nowrap align-top">
                      {entry.debit > 0 || entry.orderTotal > 0 ? (
                        <span className="font-bold text-slate-900 text-xs font-mono block">
                          PKR {Number(entry.orderTotal || entry.debit).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono text-xs">—</span>
                      )}
                    </TableCell>

                    {/* 6. Paid Amount (Wasool) */}
                    <TableCell className="px-3 py-2 text-right whitespace-nowrap align-top">
                      {Number(entry.paidAmount) > 0 || Number(entry.credit) > 0 ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="font-bold text-emerald-700 text-xs font-mono block">
                            PKR {Number(entry.paidAmount || entry.credit).toLocaleString()}
                          </span>
                          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            WASOOL (وصول)
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-400 text-xs font-mono block">PKR 0</span>
                      )}
                    </TableCell>

                    {/* 7. Remaining Dues (Baqi on Khata) */}
                    <TableCell className="px-3 py-2 text-right whitespace-nowrap align-top">
                      {isCreditOnly ? (
                        <div className="inline-flex flex-col items-end">
                          <span className={`font-bold text-xs font-mono block ${Number(entry.runningBalance) > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            PKR {Number(entry.runningBalance || 0).toLocaleString()}
                          </span>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                            Number(entry.runningBalance) > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {Number(entry.runningBalance) > 0 ? 'ABHI BAQI (باقی)' : 'CLEARED (مکمل صاف)'}
                          </span>
                        </div>
                      ) : Number(entry.remainingAmount) > 0 ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="font-bold text-rose-600 text-xs font-mono block">
                            PKR {Number(entry.remainingAmount).toLocaleString()}
                          </span>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                            Number(entry.paidAmount) > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {Number(entry.paidAmount) > 0 ? 'PARTIAL BAQI (جزوی)' : 'FULL KHATA (ادھار)'}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-end">
                          <span className="font-bold text-emerald-700 text-xs font-mono block">PKR 0</span>
                          <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            NO KHATA (صاف)
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* 8. Running Customer Balance */}
                    <TableCell className="px-3 py-2 text-right whitespace-nowrap align-top">
                      <span className="font-bold text-slate-900 text-xs font-mono block">
                        PKR {Number(entry.runningBalance || 0).toLocaleString()}
                      </span>
                    </TableCell>

                    {/* 9. Action */}
                    <TableCell className="px-3 py-2 text-center whitespace-nowrap align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewTransaction) onViewTransaction(entry);
                        }}
                        className="h-6.5 px-2 text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer gap-1 rounded border border-slate-200/60 shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer Bar */}
      <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Debits:
            </span>
            <span className="font-bold text-rose-600 font-mono">
              PKR {Number(totalCharged || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Credits:
            </span>
            <span className="font-bold text-emerald-600 font-mono">
              PKR {Number(totalPaid || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Closing Due Balance:
          </span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            PKR {Number(closingBalance || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
}

