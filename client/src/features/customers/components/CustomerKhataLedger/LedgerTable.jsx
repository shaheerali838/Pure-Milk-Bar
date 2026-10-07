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
import { recalculateCustomerStatementChronological } from '@/utils/khataAdvanceHelper';

export default function LedgerTable({
  customer,
  ledgerEntries = [],
  totalCharged = 0,
  totalPaid = 0,
  closingBalance = 0,
  advanceRemaining: propAdvanceRemaining,
  onViewCustomerProfile,
  onPayBalance,
  onViewTransaction,
}) {
  // Chronologically compute exact advance deductions and running balances for each row
  const { rowMap, summary } = React.useMemo(() => {
    return recalculateCustomerStatementChronological(ledgerEntries, customer);
  }, [ledgerEntries, customer]);

  const advanceRemaining = propAdvanceRemaining !== undefined ? propAdvanceRemaining : (summary?.advanceRemaining || 0);

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
        return { quantity: match ? match[1] : 1, unit: 'L', name: 'Cow Milk' };
      }
      return null;
    }

    if (productType === 'buffalo') {
      const found = items.find((it) => /buffalo|buff/i.test(it.name));
      if (found) return found;
      if (/buffalo|buff/i.test(entry.description || '')) {
        const match = (entry.description || '').match(/([\d.]+)\s*(?:l|ltr|liter)?\s*(?:buffalo|buff)\s*milk/i);
        return { quantity: match ? match[1] : 1, unit: 'L', name: 'Buffalo Milk' };
      }
      return null;
    }

    if (productType === 'dahi') {
      const found = items.find((it) => /dahi|yogurt/i.test(it.name));
      if (found) return found;
      if (/dahi|yogurt/i.test(entry.description || '')) {
        const match = (entry.description || '').match(/([\d.]+)\s*(?:kg|kilo)?\s*dahi/i);
        return { quantity: match ? match[1] : 1, unit: 'kg', name: 'Dahi' };
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

  const getFulfillmentText = (type = '') => {
    const lower = type.toLowerCase();
    if (lower.includes('walk-in') || lower.includes('counter') || lower.includes('store')) {
      return 'Walk-in Counter';
    }
    if (lower.includes('cod')) {
      return 'Doorstep (COD)';
    }
    if (lower.includes('doorstep') || lower.includes('delivery')) {
      return 'Doorstep Delivery';
    }
    if (lower.includes('opening')) {
      return 'Opening Balance';
    }
    return type || 'Direct Entry';
  };

  return (
    <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden rounded-xl">
      {/* Table Header Section */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight font-display">
            {customer ? `${customer.name} — Khata Statement` : 'Khata Statement'}
          </h2>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200/70 text-slate-700">
            {ledgerEntries.length} Records
          </span>
        </div>

        <div className="flex items-center gap-2">
          {advanceRemaining > 0 && (
            <div className="px-2.5 py-1 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 text-xs font-bold font-mono tabular flex items-center gap-1.5 shadow-2xs">
              <span className="text-[11px] font-medium text-teal-600">Advance Left:</span>
              <span>Rs. {Number(advanceRemaining).toLocaleString()}</span>
            </div>
          )}

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

      {/* Main Single-Line Compact Dairy Ledger Table */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full text-left border-collapse">
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-transparent">
              <TableHead className="px-2.5 py-1.5 h-8 text-[10px] text-slate-500 font-bold whitespace-nowrap">DATE</TableHead>
              <TableHead className="px-2 py-1.5 h-8 text-[10px] text-slate-500 font-bold whitespace-nowrap">COW MILK</TableHead>
              <TableHead className="px-2 py-1.5 h-8 text-[10px] text-slate-500 font-bold whitespace-nowrap">BUFFALO MILK</TableHead>
              <TableHead className="px-2 py-1.5 h-8 text-[10px] text-slate-500 font-bold whitespace-nowrap">DAHI</TableHead>
              <TableHead className="px-2 py-1.5 h-8 text-[10px] text-slate-500 font-bold whitespace-nowrap">OTHER / FEE</TableHead>
              <TableHead className="px-2 py-1.5 h-8 text-[10px] text-slate-500 font-bold whitespace-nowrap">SALE TYPE</TableHead>
              <TableHead className="px-2 py-1.5 h-8 text-[10px] text-slate-500 font-bold whitespace-nowrap">DELIVERY BOY</TableHead>
              <TableHead className="px-2.5 py-1.5 h-8 text-right text-[10px] text-slate-500 font-bold whitespace-nowrap">TOTAL BILL</TableHead>
              <TableHead className="px-2.5 py-1.5 h-8 text-right text-[10px] text-slate-500 font-bold whitespace-nowrap">PAID</TableHead>
              <TableHead className="px-2.5 py-1.5 h-8 text-right text-[10px] text-slate-500 font-bold whitespace-nowrap">BALANCE DUE</TableHead>
              <TableHead className="px-2.5 py-1.5 h-8 text-right text-[10px] text-slate-500 font-bold whitespace-nowrap">KHATA BALANCE</TableHead>
              <TableHead className="px-2 py-1.5 h-8 text-center text-[10px] text-slate-500 font-bold whitespace-nowrap">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
            {ledgerEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="px-3 py-6 text-center text-slate-400 font-medium">
                  No customer ledger transactions found.
                </TableCell>
              </TableRow>
            ) : (
              ledgerEntries.map((rawEntry, idx) => {
                const entry = normalizeLedgerEntry(rawEntry) || rawEntry;
                const computedRow = rowMap.get(rawEntry) || (rawEntry._id ? rowMap.get(String(rawEntry._id)) : null) || (rawEntry.id ? rowMap.get(String(rawEntry.id)) : null) || entry;
                
                const isCreditOnly = Number(entry.credit) > 0 && Number(entry.debit) === 0 && (!entry.items || entry.items.length === 0);
                const isOpening = entry.isOpening || entry.type === 'OPENING' || /opening/i.test(entry.description || '');
                const isCustomerAdvance =
                  String(customer?.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
                  customer?.openingPaymentMethod === 'CASH' ||
                  customer?.openingPaymentMethod === 'ONLINE';
                const isEntryAdvance = isOpening && (isCustomerAdvance || Number(entry.credit) > 0 || /advance/i.test(entry.description || ''));
                const rawOpeningAmt = Number(entry.credit || entry.debit || entry.orderTotal || customer?.openingBalance || 0);

                const isPaymentRow = computedRow.isPayment || entry.transactionType === 'CREDIT' || entry.type === 'CREDIT' || isCreditOnly;
                const rowAdvanceUsed = Number(computedRow.advanceUsed || 0);
                const rowCashPaid = Number(computedRow.cashPaid || 0);
                const rowRunningKhata = Number(computedRow.runningKhataBalance !== undefined ? computedRow.runningKhataBalance : (computedRow.runningBalance || 0));
                const rowKhataAmount = Number(computedRow.khataAmount !== undefined ? computedRow.khataAmount : 0);
                const billAmt = Number(computedRow.orderTotal !== undefined ? computedRow.orderTotal : (entry.debit > 0 ? entry.debit : 0));

                // Extract products
                const cowItem = getItemDetails(entry, 'cow');
                const buffItem = getItemDetails(entry, 'buffalo');
                const dahiItem = getItemDetails(entry, 'dahi');
                const otherItems = getItemDetails(entry, 'other');

                // Other description text
                let otherText = '—';
                if (isOpening) {
                  otherText = isEntryAdvance ? 'Advance Deposit' : 'Opening Balance';
                } else if (isPaymentRow) {
                  otherText = 'Payment Received';
                } else if (otherItems && otherItems.length > 0) {
                  otherText = otherItems.map((it) => /delivery|fee|charge/i.test(it.name) ? 'Delivery Fee' : `${it.quantity} ${it.name}`).join(', ');
                }

                // Total Bill display
                let billContent = <span className="text-slate-300 font-mono font-normal">—</span>;
                if (isOpening) {
                  if (!isEntryAdvance && rawOpeningAmt > 0) {
                    billContent = `Rs. ${rawOpeningAmt.toLocaleString()}`;
                  }
                } else if (!isPaymentRow && billAmt > 0) {
                  billContent = `Rs. ${billAmt.toLocaleString()}`;
                }

                // Paid amount display text
                let paidContent = <span className="text-slate-400 font-medium">Rs. 0</span>;
                if (isOpening) {
                  if (isEntryAdvance && rawOpeningAmt > 0) {
                    paidContent = (
                      <span className="text-emerald-700 font-mono font-bold">
                        Rs. {rawOpeningAmt.toLocaleString()} <span className="text-[10px] text-teal-600 font-semibold font-sans">(Advance)</span>
                      </span>
                    );
                  }
                } else if (isPaymentRow) {
                  const pAmt = Number(computedRow.credit || computedRow.paidAmount || entry.credit || entry.paidAmount || 0);
                  paidContent = (
                    <span className="text-emerald-700 font-mono font-bold">
                      Rs. {pAmt.toLocaleString()}
                    </span>
                  );
                } else if (rowAdvanceUsed > 0 && rowCashPaid === 0) {
                  paidContent = (
                    <span className="text-emerald-700 font-mono font-bold">
                      Rs. {rowAdvanceUsed.toLocaleString()} <span className="text-[10px] text-teal-600 font-semibold font-sans">(Advance)</span>
                    </span>
                  );
                } else if (rowAdvanceUsed > 0 && rowCashPaid > 0) {
                  paidContent = (
                    <span className="text-emerald-700 font-mono font-bold">
                      Rs. {(rowAdvanceUsed + rowCashPaid).toLocaleString()} <span className="text-[10px] text-teal-600 font-semibold font-sans">({rowAdvanceUsed} Adv + {rowCashPaid} Cash)</span>
                    </span>
                  );
                } else if (rowCashPaid > 0) {
                  paidContent = (
                    <span className="text-emerald-700 font-mono font-bold">
                      Rs. {rowCashPaid.toLocaleString()}
                    </span>
                  );
                }

                // Balance Due (Due Added in this row) display
                let balanceDueContent = <span className="text-emerald-700 font-mono font-bold">Rs. 0</span>;
                if (isOpening && !isEntryAdvance && rawOpeningAmt > 0) {
                  balanceDueContent = <span className="text-rose-600 font-mono font-bold">Rs. {rawOpeningAmt.toLocaleString()}</span>;
                } else if (!isOpening && !isPaymentRow && rowKhataAmount > 0) {
                  balanceDueContent = <span className="text-rose-600 font-mono font-bold">Rs. {rowKhataAmount.toLocaleString()}</span>;
                }

                return (
                  <TableRow
                    key={entry.id || idx}
                    onClick={() => onViewTransaction && onViewTransaction({ ...entry, ...computedRow })}
                    title="Click to view transaction details"
                    className="hover:bg-slate-50 transition-colors cursor-pointer h-9"
                  >
                    {/* 1. Date */}
                    <TableCell className="px-2.5 py-1.5 whitespace-nowrap align-middle font-semibold text-slate-800">
                      {entry.date}
                    </TableCell>

                    {/* 2. Cow Milk */}
                    <TableCell className="px-2 py-1.5 whitespace-nowrap align-middle">
                      {cowItem ? (
                        <span className="font-semibold text-slate-900">
                          {cowItem.quantity} {cowItem.unit ? cowItem.unit.replace(/^per\s+/i, '') : 'L'}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </TableCell>

                    {/* 3. Buffalo Milk */}
                    <TableCell className="px-2 py-1.5 whitespace-nowrap align-middle">
                      {buffItem ? (
                        <span className="font-semibold text-slate-900">
                          {buffItem.quantity} {buffItem.unit ? buffItem.unit.replace(/^per\s+/i, '') : 'L'}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </TableCell>

                    {/* 4. Dahi */}
                    <TableCell className="px-2 py-1.5 whitespace-nowrap align-middle">
                      {dahiItem ? (
                        <span className="font-semibold text-slate-900">
                          {dahiItem.quantity} {dahiItem.unit ? dahiItem.unit.replace(/^per\s+/i, '') : 'kg'}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </TableCell>

                    {/* 5. Other Products / Delivery Fee */}
                    <TableCell className="px-2 py-1.5 whitespace-nowrap align-middle text-slate-600 font-medium">
                      {otherText}
                    </TableCell>

                    {/* 6. Sale Type (Plain text) */}
                    <TableCell className="px-2 py-1.5 whitespace-nowrap align-middle text-slate-700 font-medium">
                      {isPaymentRow ? 'Payment Received' : getFulfillmentText(entry.fulfillmentType)}
                    </TableCell>

                    {/* 7. Delivery Boy (Plain text) */}
                    <TableCell className="px-2 py-1.5 whitespace-nowrap align-middle text-slate-700 font-medium">
                      {entry.riderName || (entry.fulfillmentType?.toLowerCase().includes('walk') || entry.fulfillmentType?.toLowerCase().includes('counter') ? (
                        <span className="text-slate-400 font-normal">Counter Staff</span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      ))}
                    </TableCell>

                    {/* 8. Total Bill */}
                    <TableCell className="px-2.5 py-1.5 text-right whitespace-nowrap align-middle font-bold text-slate-800 font-mono">
                      {billContent}
                    </TableCell>

                    {/* 9. Paid Amount */}
                    <TableCell className="px-2.5 py-1.5 text-right whitespace-nowrap align-middle font-bold font-mono">
                      {paidContent}
                    </TableCell>

                    {/* 10. Balance Due (Due Added) */}
                    <TableCell className="px-2.5 py-1.5 text-right whitespace-nowrap align-middle font-bold font-mono">
                      {balanceDueContent}
                    </TableCell>

                    {/* 11. Running Khata Balance */}
                    <TableCell className="px-2.5 py-1.5 text-right whitespace-nowrap align-middle font-bold font-mono">
                      <span className={rowRunningKhata > 0 ? 'text-slate-800' : 'text-emerald-700'}>
                        Rs. {rowRunningKhata.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* 12. Actions */}
                    <TableCell className="px-2 py-1.5 text-center whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewTransaction) onViewTransaction({ ...entry, ...computedRow });
                        }}
                        title="View Details"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition cursor-pointer inline-flex items-center justify-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
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

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              Advance Remaining:
            </span>
            <span className="font-bold text-teal-800 font-mono">
              Rs. {Number(advanceRemaining || 0).toLocaleString()}
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


