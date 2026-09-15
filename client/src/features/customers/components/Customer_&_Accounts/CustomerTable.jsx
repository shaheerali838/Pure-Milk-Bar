import React from 'react';
import { Eye, Edit2, Smartphone, Milk } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CustomerTable({ onViewCustomer, onEditCustomer }) {
  const { customers } = useCustomerContext();
  const { addLedgerEntry } = useLedgerContext();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto max-h-[calc(100vh-270px)]">
        <Table className="w-full text-left border-collapse min-w-190">
          <TableHeader sticky className="bg-slate-50 border-b border-slate-100">
            <TableRow className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-transparent">
              <TableHead className="px-3 py-2 h-auto text-[10px] text-slate-400">CUSTOMER</TableHead>
              <TableHead className="px-3 py-2 h-auto text-[10px] text-slate-400">PHONE &amp; ONLINE</TableHead>
              <TableHead className="px-3 py-2 h-auto text-[10px] text-slate-400">SUBSCRIPTION</TableHead>
              <TableHead className="px-3 py-2 h-auto text-[10px] text-slate-400">CREDIT LIMIT</TableHead>
              <TableHead className="px-3 py-2 h-auto text-[10px] text-slate-400">KHATA BALANCE</TableHead>
              <TableHead className="px-3 py-2 h-auto text-[10px] text-slate-400">PAYMENT MODE</TableHead>
              <TableHead className="px-3 py-2 h-auto text-[10px] text-slate-400">STATUS</TableHead>
              <TableHead className="px-3 py-2 h-auto text-[10px] text-slate-400 text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-3 py-8 text-center text-slate-400 font-medium">
                  No customers found. Click "+ Add New Customer" to add one!
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => {
                const initial = c.name ? c.name.charAt(0).toUpperCase() : 'C';
                const khataPercent = Math.min(
                  100,
                  Math.round(((c.khataBalance || 0) / (c.creditLimit || 10000)) * 100)
                );

                return (
                  <TableRow
                    key={c.id}
                    onClick={() => onViewCustomer && onViewCustomer(c)}
                    title={`Click to view Khata ledger & complete details of ${c.name}`}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    {/* Customer */}
                    <TableCell className="px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">{c.name}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">{c.area || 'Model Town'}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Phone & Online Account */}
                    <TableCell className="px-3.5 py-2">
                      <div className="font-semibold text-slate-800 leading-tight">{c.phone}</div>
                      {c.onlineAccount && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                          <Smartphone className="w-2.5 h-2.5" />
                          {c.onlineAccount}
                        </div>
                      )}
                    </TableCell>

                    {/* Daily Subscription */}
                    <TableCell className="px-3.5 py-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200/60">
                        <Milk className="w-2.5 h-2.5 text-slate-500" />
                        {c.subscription || '2 L Cow Milk'}
                      </span>
                    </TableCell>

                    {/* Credit Limit */}
                    <TableCell className="px-3.5 py-2 font-bold text-slate-800 tabular">
                      Rs. {(c.creditLimit || 0).toLocaleString()}
                    </TableCell>

                    {/* Khata Balance */}
                    <TableCell className="px-3.5 py-2">
                      <div className="font-bold text-slate-900 leading-tight tabular">
                        Rs. {(c.khataBalance || 0).toLocaleString()}
                      </div>
                      <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${khataPercent}%` }}
                        />
                      </div>
                    </TableCell>

                    {/* Payment Mode */}
                    <TableCell className="px-3.5 py-2">
                      {c.paymentMode === 'Online Payment' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                          Online Payment
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const balance = Number(c.khataBalance) || 0;
                            if (balance <= 0) {
                              alert(`${c.name} has no outstanding khata balance.`);
                              return;
                            }
                            if (
                              window.confirm(
                                `Clear and finish full Khata debt of Rs. ${balance.toLocaleString()} for ${c.name}?`
                              )
                            ) {
                              addLedgerEntry(c.id, {
                                description: 'Khata Full Settlement / Received',
                                credit: balance,
                                debit: 0,
                                method: 'Cash',
                                notes: 'Full Khata finished and cleared directly',
                              });
                              alert(`Khata for ${c.name} has been finished.`);
                            }
                          }}
                          title={
                            (Number(c.khataBalance) || 0) > 0
                              ? 'Click to direct finish & clear Khata'
                              : 'Khata account (No outstanding debt)'
                          }
                          className="px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-semibold border border-purple-200/60 transition cursor-pointer"
                        >
                          Khata · Finish
                        </button>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-3.5 py-2">
                      <Badge
                        variant={c.status === 'Active' ? 'green' : 'slate'}
                        className="text-[10px] font-semibold px-2 py-0.5"
                      >
                        {c.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-3.5 py-2 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewCustomer) onViewCustomer(c);
                          }}
                          title="View Khata Ledger & Details"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditCustomer) onEditCustomer(c);
                          }}
                          title="Edit Customer"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
