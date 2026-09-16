import { useState } from 'react';
import { Eye, Search, CreditCard, Pencil } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CustomerFinanceLedgerTable({ onViewDetail, onRecordPayment, onEditCustomer }) {
  const { rawCustomers } = useCustomerContext();
  const { getLedgerForCustomer } = useLedgerContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Financial Status');

  const customerList = (rawCustomers || []).map((customer, index) => {
    const entries = getLedgerForCustomer(customer.id) || [];
    const totalPaid = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
    const lastPaymentEntry = [...entries].reverse().find((e) => Number(e.credit) > 0);
    const outstanding = Number(customer.khataBalance) || 0;

    let overallStatus = 'Credit Overdue';
    if (outstanding === 0) overallStatus = 'Paid Up';
    else if (totalPaid > 0) overallStatus = 'Half-Paid';

    const lastPaymentDate = lastPaymentEntry
      ? lastPaymentEntry.date
      : (customer.createdAt || 'Opening');

    const lastPaymentLabel = lastPaymentEntry
      ? (lastPaymentEntry.method || 'Online Payment')
      : 'Credit (No Payment)';

    const custCode = `CUST-${String(customer.id).slice(-4) || String(index + 1).padStart(4, '0')}`;

    return {
      customer,
      custCode,
      totalPaid,
      outstanding,
      lastPaymentDate,
      lastPaymentLabel,
      overallStatus,
    };
  });

  const filteredCustomers = customerList.filter(({ customer, overallStatus }) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      (customer.name && customer.name.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.includes(term)) ||
      (customer.area && customer.area.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === 'All Financial Status' || overallStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-2.5">
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by customer name, phone, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-md text-xs focus-visible:border-emerald-500 focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>

        <div className="w-48">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          >
            <SelectTrigger className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-700 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Financial Status" className="text-xs">All Financial Status</SelectItem>
              <SelectItem value="Paid Up" className="text-xs">Paid Up</SelectItem>
              <SelectItem value="Half-Paid" className="text-xs">Half-Paid</SelectItem>
              <SelectItem value="Credit Overdue" className="text-xs">Credit Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
          <Table className="w-full text-left border-collapse min-w-[900px]">
            <TableHeader className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
              <TableRow className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50">
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">CUSTOMER</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">AREA &amp; CONTACT</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">CREDIT LIMIT</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">TOTAL PAID</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">CREDIT (OUTSTANDING)</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">LAST PAYMENT / STATUS</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-center text-slate-400 font-bold">OVERALL STATUS</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-3.5 py-8 text-center text-slate-400 font-medium">
                    No customers found matching search and filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map(({
                  customer,
                  custCode,
                  totalPaid,
                  outstanding,
                  lastPaymentDate,
                  lastPaymentLabel,
                  overallStatus,
                }) => {
                  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';

                  return (
                    <TableRow
                      key={customer.id}
                      onClick={() => onViewDetail && onViewDetail(customer)}
                      title={`Click to view financial details of ${customer.name}`}
                      className="hover:bg-emerald-50/40 transition-colors cursor-pointer group select-none"
                    >
                      <TableCell className="px-3.5 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 transition-colors font-display">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-emerald-950 leading-tight transition-colors font-display">
                              {customer.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 leading-tight tabular">{custCode}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-3.5 py-2">
                        <div className="font-semibold text-slate-800 leading-tight tabular">{customer.phone}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{customer.area || 'Model Town'}</div>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-bold text-slate-700 whitespace-nowrap tabular">
                        Rs. {(customer.creditLimit || 10000).toLocaleString()}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-bold text-emerald-600 whitespace-nowrap tabular">
                        Rs. {totalPaid.toLocaleString()}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-black whitespace-nowrap tabular">
                        {outstanding === 0 ? (
                          <span className="text-emerald-600">Cleared (Rs. 0)</span>
                        ) : (
                          <span className="text-rose-600">Rs. {outstanding.toLocaleString()}</span>
                        )}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-600 tabular">{lastPaymentDate}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/60 text-[9px] font-semibold">
                          {lastPaymentLabel}
                        </span>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            overallStatus === 'Paid Up'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : overallStatus === 'Half-Paid'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border-rose-200/60'
                          }`}
                        >
                          {overallStatus}
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
                              if (onViewDetail) onViewDetail(customer);
                            }}
                            title="View Financial Ledger Details"
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
                              else if (onViewDetail) onViewDetail(customer);
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
          </Table>
        </div>
      </div>
    </div>
  );
}

