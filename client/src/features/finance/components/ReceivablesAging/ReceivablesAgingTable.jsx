import { useState } from 'react';
import { Eye, Search, CreditCard, Pencil } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function getAgingBuckets(entries, customerKhataBalance) {
  const charges = (entries || [])
    .filter((e) => Number(e.debit) > 0 || e.type === 'OPENING')
    .map((e) => ({
      date: e.date,
      remaining: Number(e.debit) || Number(e.runningBalance) || 0,
    }));

  let payments = (entries || []).reduce((sum, e) => sum + (Number(e.credit) || 0), 0);

  for (const charge of charges) {
    if (payments <= 0) break;
    const applied = Math.min(charge.remaining, payments);
    charge.remaining -= applied;
    payments -= applied;
  }

  const buckets = { d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
  const today = new Date();

  charges.forEach((charge) => {
    if (charge.remaining <= 0) return;
    const ageDays = Math.floor((today - new Date(charge.date)) / (1000 * 60 * 60 * 24));
    if (ageDays <= 30) buckets.d0_30 += charge.remaining;
    else if (ageDays <= 60) buckets.d31_60 += charge.remaining;
    else if (ageDays <= 90) buckets.d61_90 += charge.remaining;
    else buckets.d90plus += charge.remaining;
  });

  const totalInBuckets = buckets.d0_30 + buckets.d31_60 + buckets.d61_90 + buckets.d90plus;
  const balance = Number(customerKhataBalance || 0);
  if (totalInBuckets !== balance && balance > 0) {
    if (totalInBuckets === 0) {
      buckets.d0_30 = balance;
    } else {
      const diff = balance - totalInBuckets;
      buckets.d0_30 = Math.max(0, buckets.d0_30 + diff);
    }
  }

  return buckets;
}

export default function ReceivablesAgingTable({ onViewDetail, onRecordPayment, onEditCustomer }) {
  const { rawCustomers } = useCustomerContext();
  const { getLedgerForCustomer } = useLedgerContext();

  const [searchQuery, setSearchQuery] = useState('');

  // Only customers with outstanding balance > 0
  const customersWithDues = (rawCustomers || [])
    .filter((c) => Number(c.khataBalance || 0) > 0)
    .map((customer) => {
      const entries = getLedgerForCustomer(customer.id) || [];
      const buckets = getAgingBuckets(entries, customer.khataBalance);
      const total = Number(customer.khataBalance || 0);

      let risk = 'Low';
      if (buckets.d90plus > 0) risk = 'High';
      else if (buckets.d61_90 > 0) risk = 'Medium';

      return {
        customer,
        buckets,
        total,
        risk,
      };
    });

  const filteredRows = customersWithDues.filter(({ customer }) => {
    const term = searchQuery.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.includes(term)) ||
      (customer.area && customer.area.toLowerCase().includes(term))
    );
  });

  // Totals for the table footer
  const sum0_30 = filteredRows.reduce((acc, r) => acc + r.buckets.d0_30, 0);
  const sum31_60 = filteredRows.reduce((acc, r) => acc + r.buckets.d31_60, 0);
  const sum61_90 = filteredRows.reduce((acc, r) => acc + r.buckets.d61_90, 0);
  const sum90plus = filteredRows.reduce((acc, r) => acc + r.buckets.d90plus, 0);
  const sumTotal = filteredRows.reduce((acc, r) => acc + r.total, 0);

  return (
    <div className="space-y-2.5">
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold text-slate-700">
          <span>{customersWithDues.length} customers with outstanding balance</span>
        </div>

        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by name, phone, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-md text-xs focus-visible:border-emerald-500 focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
          <Table className="w-full text-left border-collapse min-w-[920px]">
            <TableHeader className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
              <TableRow className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50">
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">CUSTOMER</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">0–30D</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">31–60D</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">61–90D</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">90+D</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">TOTAL</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-center w-36 text-slate-400 font-bold">DISTRIBUTION</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-center text-slate-400 font-bold">RISK</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-3.5 py-8 text-center text-slate-400 font-medium">
                    No customers with outstanding balances found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map(({ customer, buckets, total, risk }) => {
                  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';

                  const p0_30 = total > 0 ? (buckets.d0_30 / total) * 100 : 0;
                  const p31_60 = total > 0 ? (buckets.d31_60 / total) * 100 : 0;
                  const p61_90 = total > 0 ? (buckets.d61_90 / total) * 100 : 0;
                  const p90plus = total > 0 ? (buckets.d90plus / total) * 100 : 0;

                  return (
                    <TableRow
                      key={customer.id}
                      onClick={() => onViewDetail && onViewDetail(customer, buckets)}
                      title={`Click to view aging breakdown for ${customer.name}`}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group select-none"
                    >
                      <TableCell className="px-3.5 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 group-hover:bg-amber-100 group-hover:text-amber-800 font-bold flex items-center justify-center text-xs shrink-0 transition-colors font-display">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-amber-950 leading-tight transition-colors font-display">
                              {customer.name}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight tabular">{customer.phone} · {customer.area || 'Model Town'}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-medium text-slate-700 whitespace-nowrap tabular">
                        {buckets.d0_30 > 0 ? `Rs. ${buckets.d0_30.toLocaleString()}` : '—'}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-medium text-slate-700 whitespace-nowrap tabular">
                        {buckets.d31_60 > 0 ? `Rs. ${buckets.d31_60.toLocaleString()}` : '—'}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-medium text-slate-700 whitespace-nowrap tabular">
                        {buckets.d61_90 > 0 ? `Rs. ${buckets.d61_90.toLocaleString()}` : '—'}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-bold text-rose-600 whitespace-nowrap tabular">
                        {buckets.d90plus > 0 ? `Rs. ${buckets.d90plus.toLocaleString()}` : '—'}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-black text-slate-900 whitespace-nowrap tabular">
                        Rs. {total.toLocaleString()}
                      </TableCell>

                      <TableCell className="px-3.5 py-2">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                          {p0_30 > 0 && <div style={{ width: `${p0_30}%` }} className="bg-blue-500 h-full" />}
                          {p31_60 > 0 && <div style={{ width: `${p31_60}%` }} className="bg-amber-500 h-full" />}
                          {p61_90 > 0 && <div style={{ width: `${p61_90}%` }} className="bg-orange-500 h-full" />}
                          {p90plus > 0 && <div style={{ width: `${p90plus}%` }} className="bg-rose-500 h-full" />}
                        </div>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            risk === 'High'
                              ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                              : risk === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          }`}
                        >
                          {risk}
                        </span>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewDetail) onViewDetail(customer, buckets);
                            }}
                            title="View Aging Breakdown"
                            className="p-1.5 h-7 w-7 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs group/btn"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onRecordPayment) onRecordPayment(customer);
                            }}
                            title="Record Khata Payment (PKR)"
                            className="p-1.5 h-7 w-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200/80 transition-all cursor-pointer shadow-2xs group/btn"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEditCustomer) onEditCustomer(customer);
                            }}
                            title="Edit Customer Profile"
                            className="p-1.5 h-7 w-7 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white border border-amber-200/80 transition-all cursor-pointer shadow-2xs group/btn"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {filteredRows.length > 0 && (
              <TableFooter className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-xs text-slate-900">
                <TableRow>
                  <TableCell className="px-3.5 py-2 uppercase font-black text-slate-800">Totals</TableCell>
                  <TableCell className="px-3.5 py-2 text-right tabular">Rs. {sum0_30.toLocaleString()}</TableCell>
                  <TableCell className="px-3.5 py-2 text-right tabular">Rs. {sum31_60.toLocaleString()}</TableCell>
                  <TableCell className="px-3.5 py-2 text-right tabular">Rs. {sum61_90.toLocaleString()}</TableCell>
                  <TableCell className="px-3.5 py-2 text-right text-rose-600 tabular">Rs. {sum90plus.toLocaleString()}</TableCell>
                  <TableCell className="px-3.5 py-2 text-right font-black tabular">Rs. {sumTotal.toLocaleString()}</TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}

