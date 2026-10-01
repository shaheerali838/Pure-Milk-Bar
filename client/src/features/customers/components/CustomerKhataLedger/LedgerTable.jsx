import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  onPayBalance,
  onViewTransaction,
}) {
  // Chronologically compute exact running balances for each row
  const computedRunningBalances = React.useMemo(() => {
    const isAdvance =
      String(customer?.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
      customer?.openingPaymentMethod === 'CASH' ||
      customer?.openingPaymentMethod === 'ONLINE';
    const openingBal = Number(customer?.openingBalance || 0);
    // Chronological order (oldest to newest)
    const reversed = [...ledgerEntries].reverse();
    let running = isAdvance ? -openingBal : openingBal;
    const map = new Map();

    reversed.forEach((raw) => {
      const e = normalizeLedgerEntry(raw) || raw;
      const isOpening = e.isOpening || e.type === 'OPENING';
      if (isOpening) {
        const isEntryAdvance = Number(e.credit || 0) > 0 || isAdvance;
        running = isEntryAdvance ? -Number(e.credit || openingBal) : Number(e.debit || openingBal);
      } else {
        running += (Number(e.debit || e.debitAmount) || 0) - (Number(e.credit || e.creditAmount) || 0);
      }
      map.set(raw, Math.max(0, running));
    });

    return map;
  }, [ledgerEntries, customer]);

  // Extract specific product details from entry items or description
  const getItemDetails = (entry, productType) => {
    if (entry.isOpening || entry.type === 'OPENING' || (Number(entry.credit) > 0 && Number(entry.debit) === 0 && (!entry.items || entry.items.length === 0))) {
      return null;
    }
    const items = Array.isArray(entry.items) && entry.items.length > 0 ? entry.items : [];

    if (productType === 'cow') {
      const found = items.find((it) => /cow/i.test(it.name));
      if (found) return found;
      if (/cow/i.test(entry.description || '')) {
        const match = (entry.description || '').match(/([\d.]+)\s*(?:l|ltr|liter)?\s*cow\s*milk/i);
        return { quantity: match ? match[1] : 1, unit: 'L', name: 'Cow Milk', price: 0, subtotal: entry.orderTotal || entry.debit };
      }
      return null;
    }

    if (productType === 'buffalo') {
      const found = items.find((it) => /buffalo|buff/i.test(it.name));
      if (found) return found;
      if (/buffalo|buff/i.test(entry.description || '')) {
        const match = (entry.description || '').match(/([\d.]+)\s*(?:l|ltr|liter)?\s*(?:buffalo|buff)\s*milk/i);
        return { quantity: match ? match[1] : 1, unit: 'L', name: 'Buffalo Milk', price: 0, subtotal: entry.orderTotal || entry.debit };
      }
      return null;
    }

    if (productType === 'dahi') {
      const found = items.find((it) => /dahi|yogurt/i.test(it.name));
      if (found) return found;
      if (/dahi|yogurt/i.test(entry.description || '')) {
        const match = (entry.description || '').match(/([\d.]+)\s*(?:kg|kilo)?\s*dahi/i);
        return { quantity: match ? match[1] : 1, unit: 'kg', name: 'Dahi', price: 0, subtotal: entry.orderTotal || entry.debit };
      }
      return null;
    }

    if (productType === 'other') {
      const otherList = items.filter(
        (it) =>
          !/cow/i.test(it.name) &&
          !/buffalo|buff/i.test(it.name) &&
          !/dahi|yogurt/i.test(it.name)
      );
      return otherList.length > 0 ? otherList : null;
    }

    return null;
  };

  const getFulfillmentBadge = (type = '') => {
    const lower = type.toLowerCase();
    if (lower.includes('walk-in') || lower.includes('counter') || lower.includes('store')) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/70 text-xs font-semibold">
          Walk-in Counter
        </span>
      );
    }
    if (lower.includes('cod')) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/70 text-xs font-semibold">
          Doorstep (COD)
        </span>
      );
    }
    if (lower.includes('doorstep') || lower.includes('delivery')) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-xs font-semibold">
          Doorstep Delivery
        </span>
      );
    }
    if (lower.includes('opening')) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
          Opening Balance
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
        {type || 'Direct Entry'}
      </span>
    );
  };

  return (
    <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden rounded-xl">
      {/* Table Header Section */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight font-display">
            {customer ? `${customer.name} — Khata Statement` : 'Khata Statement'}
          </h2>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200/70 text-slate-700">
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
              className="h-7 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-2xs"
            >
              Profile
            </Button>
          )}

          <div
            className={`px-3 py-1 rounded-lg border text-xs font-bold font-mono tabular flex items-center gap-2 shadow-2xs ${
              closingBalance > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Due:</span>
              <span>Rs. {Number(closingBalance || 0).toLocaleString()}</span>
            </div>

            {closingBalance > 0 && onPayBalance && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayBalance(null, closingBalance);
                }}
                className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition active:scale-95 ml-1"
                title={`Pay current due balance of Rs. ${Number(closingBalance || 0).toLocaleString()}`}
              >
                Pay
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Multi-Column Dairy Ledger Table */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full text-left border-collapse">
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-transparent">
              <TableHead className="px-2.5 py-2 h-auto text-[10px] text-slate-400 font-bold whitespace-nowrap">DATE &amp; REF</TableHead>
              <TableHead className="px-2 py-2 h-auto text-[10px] text-slate-400 font-bold whitespace-nowrap">COW MILK</TableHead>
              <TableHead className="px-2 py-2 h-auto text-[10px] text-slate-400 font-bold whitespace-nowrap">BUFFALO MILK</TableHead>
              <TableHead className="px-2 py-2 h-auto text-[10px] text-slate-400 font-bold whitespace-nowrap">DAHI</TableHead>
              <TableHead className="px-2 py-2 h-auto text-[10px] text-slate-400 font-bold whitespace-nowrap">OTHER / FEE</TableHead>
              <TableHead className="px-2 py-2 h-auto text-[10px] text-slate-400 font-bold whitespace-nowrap">SALE TYPE</TableHead>
              <TableHead className="px-2 py-2 h-auto text-[10px] text-slate-400 font-bold whitespace-nowrap">DELIVERY BOY</TableHead>
              <TableHead className="px-2 py-2 h-auto text-right text-[10px] text-slate-400 font-bold whitespace-nowrap">TOTAL BILL</TableHead>
              <TableHead className="px-2 py-2 h-auto text-right text-[10px] text-slate-400 font-bold whitespace-nowrap">PAID</TableHead>
              <TableHead className="px-2 py-2 h-auto text-right text-[10px] text-slate-400 font-bold whitespace-nowrap">BALANCE DUE</TableHead>
              <TableHead className="px-2 py-2 h-auto text-right text-[10px] text-slate-400 font-bold whitespace-nowrap">KHATA BALANCE</TableHead>
              <TableHead className="px-2 py-2 h-auto text-right text-[10px] text-slate-400 font-bold whitespace-nowrap">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
            {ledgerEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="px-3 py-8 text-center text-slate-400 font-medium">
                  No customer ledger transactions found.
                </TableCell>
              </TableRow>
            ) : (
              ledgerEntries.map((rawEntry, idx) => {
                const entry = normalizeLedgerEntry(rawEntry) || rawEntry;
                const isCreditOnly = Number(entry.credit) > 0 && Number(entry.debit) === 0 && (!entry.items || entry.items.length === 0);
                const isOpening = entry.isOpening || entry.type === 'OPENING' || /opening/i.test(entry.description || '');
                const isCustomerAdvance =
                  String(customer?.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
                  customer?.openingPaymentMethod === 'CASH' ||
                  customer?.openingPaymentMethod === 'ONLINE';
                const isEntryAdvance = isOpening && (isCustomerAdvance || Number(entry.credit) > 0 || /advance/i.test(entry.description || ''));
                const rawOpeningAmt = Number(entry.credit || entry.debit || entry.orderTotal || customer?.openingBalance || 0);

                // Extract products
                const cowItem = getItemDetails(entry, 'cow');
                const buffItem = getItemDetails(entry, 'buffalo');
                const dahiItem = getItemDetails(entry, 'dahi');
                const otherItems = getItemDetails(entry, 'other');

                return (
                  <TableRow
                    key={entry.id || idx}
                    onClick={() => onViewTransaction && onViewTransaction(entry)}
                    title="Click to view full transaction invoice"
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    {/* 1. Date & Invoice / Ref */}
                    <TableCell className="px-2.5 py-2 whitespace-nowrap align-top">
                      <div className="font-bold text-slate-800 leading-tight">
                        {entry.date}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 leading-tight mt-0.5">
                        {entry.invoiceId || entry.id || `TXN-#${idx + 1}`}
                      </div>
                    </TableCell>

                    {/* 2. Cow Milk Column */}
                    <TableCell className="px-2.5 py-2 align-top">
                      {cowItem ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 leading-tight">
                            {cowItem.quantity} {cowItem.unit ? cowItem.unit.replace(/^per\s+/i, '') : 'L'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {cowItem.subtotal ? `Rs. ${Number(cowItem.subtotal).toLocaleString()}` : cowItem.price ? `@ Rs.${cowItem.price}` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </TableCell>

                    {/* 3. Buffalo Milk Column */}
                    <TableCell className="px-2.5 py-2 align-top">
                      {buffItem ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 leading-tight">
                            {buffItem.quantity} {buffItem.unit ? buffItem.unit.replace(/^per\s+/i, '') : 'L'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {buffItem.subtotal ? `Rs. ${Number(buffItem.subtotal).toLocaleString()}` : buffItem.price ? `@ Rs.${buffItem.price}` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </TableCell>

                    {/* 4. Dahi Column */}
                    <TableCell className="px-2.5 py-2 align-top">
                      {dahiItem ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 leading-tight">
                            {dahiItem.quantity} {dahiItem.unit ? dahiItem.unit.replace(/^per\s+/i, '') : 'kg'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {dahiItem.subtotal ? `Rs. ${Number(dahiItem.subtotal).toLocaleString()}` : dahiItem.price ? `@ Rs.${dahiItem.price}` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </TableCell>

                    {/* 5. Other Products / Delivery Fee Column */}
                    <TableCell className="px-2.5 py-2 align-top">
                      {isOpening ? (
                        <span className="text-[11px] font-semibold text-slate-600">
                          {isEntryAdvance ? 'Advance Deposit' : 'Opening Balance'}
                        </span>
                      ) : isCreditOnly ? (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Payment Received
                        </span>
                      ) : otherItems && otherItems.length > 0 ? (
                        <div className="space-y-1">
                          {otherItems.map((it, oIdx) => {
                            const isFee = /delivery|fee|charge/i.test(it.name);
                            return (
                              <div key={oIdx} className="text-[11px] leading-tight">
                                <span className="font-bold text-slate-800">
                                  {isFee ? 'Delivery Fee' : `${it.quantity} ${it.name}`}:
                                </span>{' '}
                                <span className="text-slate-600 font-medium">
                                  Rs. {Number(it.subtotal || it.price * it.quantity || 0).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </TableCell>

                    {/* 6. Sale Type / Kes tara sale howa */}
                    <TableCell className="px-2.5 py-2 align-top">
                      {getFulfillmentBadge(entry.fulfillmentType)}
                    </TableCell>

                    {/* 7. Delivery Boy / Kis ne delivery ki */}
                    <TableCell className="px-2.5 py-2 align-top">
                      {entry.riderName ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60 text-xs font-semibold">
                          {entry.riderName}
                        </span>
                      ) : entry.fulfillmentType?.toLowerCase().includes('walk') || entry.fulfillmentType?.toLowerCase().includes('counter') ? (
                        <span className="text-[11px] text-slate-500 font-medium">
                          Counter Staff
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </TableCell>

                    {/* 8. Total Bill */}
                    <TableCell className="px-2.5 py-2 text-right whitespace-nowrap align-top">
                      {isOpening ? (
                        <span className="font-bold text-slate-800 text-xs font-mono block">
                          Rs. {rawOpeningAmt.toLocaleString()}
                        </span>
                      ) : (entry.debit > 0 || entry.orderTotal > 0) ? (
                        <span className="font-bold text-slate-800 text-xs font-mono block">
                          Rs. {Number(entry.orderTotal || entry.debit).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono text-xs">—</span>
                      )}
                    </TableCell>

                    {/* 9. Paid Amount */}
                    <TableCell className="px-2.5 py-2 text-right whitespace-nowrap align-top">
                      {isOpening ? (
                        isEntryAdvance ? (
                          <span className="font-bold text-emerald-700 text-xs font-mono block">
                            Rs. {rawOpeningAmt.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-400 text-xs font-mono block">Rs. 0</span>
                        )
                      ) : (Number(entry.paidAmount) > 0 || Number(entry.credit) > 0) ? (
                        <span className="font-bold text-emerald-700 text-xs font-mono block">
                          Rs. {Number(entry.paidAmount || entry.credit).toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-medium text-slate-400 text-xs font-mono block">Rs. 0</span>
                      )}
                    </TableCell>

                    {/* 10. Balance Due */}
                    <TableCell className="px-2.5 py-2 text-right whitespace-nowrap align-top">
                      {closingBalance <= 0 ? (
                        <span className="font-bold text-emerald-700 text-xs font-mono block">
                          Rs. 0
                        </span>
                      ) : isOpening ? (
                        isEntryAdvance ? (
                          <span className="font-bold text-emerald-700 text-xs font-mono block">
                            Rs. 0
                          </span>
                        ) : rawOpeningAmt > 0 ? (
                          <span className="font-bold text-rose-600 text-xs font-mono block">
                            Rs. {Math.min(closingBalance, rawOpeningAmt).toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700 text-xs font-mono block">Rs. 0</span>
                        )
                      ) : isCreditOnly ? (
                        <span className={`font-bold text-xs font-mono block ${closingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          Rs. {closingBalance.toLocaleString()}
                        </span>
                      ) : Number(entry.remainingAmount || entry.debit) > 0 ? (
                        <span className="font-bold text-rose-600 text-xs font-mono block">
                          Rs. {Math.min(closingBalance, Number(entry.remainingAmount || entry.debit)).toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 text-xs font-mono block">Rs. 0</span>
                      )}
                    </TableCell>

                    {/* 11. Running Khata Balance */}
                    <TableCell className="px-2.5 py-2 text-right whitespace-nowrap align-top">
                      <span className={`font-bold text-xs font-mono block ${Number(computedRunningBalances.get(rawEntry) ?? entry.runningBalance ?? 0) > 0 ? 'text-slate-800' : 'text-emerald-700'}`}>
                        Rs. {Number(computedRunningBalances.get(rawEntry) ?? entry.runningBalance ?? 0).toLocaleString()}
                      </span>
                    </TableCell>

                    {/* 12. Actions */}
                    <TableCell className="px-2.5 py-2 text-right whitespace-nowrap align-top">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rowBalance = Number(computedRunningBalances.get(rawEntry) ?? entry.runningBalance ?? 0);
                          if (onViewTransaction) onViewTransaction({ ...entry, runningBalance: rowBalance });
                        }}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Debits:
            </span>
            <span className="font-bold text-rose-600 font-mono">
              Rs. {Number(totalCharged || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Credits:
            </span>
            <span className="font-bold text-emerald-600 font-mono">
              Rs. {Number(totalPaid || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Closing Due Balance:
          </span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            Rs. {Number(closingBalance || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
