import { useState } from 'react';
import { Eye, Search, CreditCard, Pencil, Download } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { exportTableToCSV } from '@/utils/csvExport';
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

function getAllCollections(rawCustomers, ledgers) {
  const rows = [];
  (rawCustomers || []).forEach((customer) => {
    const entries = ledgers[String(customer.id)] || [];
    entries.forEach((entry) => {
      if (Number(entry.credit) > 0) {
        rows.push({ customer, entry });
      }
    });
  });
  return rows.sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));
}

export default function CollectionPayoutsTable({ onViewReceipt, onRecordPayment, onEditCustomer }) {
  const { rawCustomers } = useCustomerContext();
  const { ledgers } = useLedgerContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const allCollections = getAllCollections(rawCustomers, ledgers);

  const filteredRows = allCollections.filter(({ customer, entry }) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      (customer.name && customer.name.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.includes(term)) ||
      (entry.method && entry.method.toLowerCase().includes(term)) ||
      (entry.notes && entry.notes.toLowerCase().includes(term)) ||
      (entry.description && entry.description.toLowerCase().includes(term));

    const isPending = entry.method === 'Bank' || entry.method === 'Bank Transfer';
    const status = isPending ? 'Pending' : 'Confirmed';

    const matchesStatus =
      statusFilter === 'All Status' || status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = [
      'Slip Ref ID',
      'Date',
      'Customer ID',
      'Customer Name',
      'Customer Phone',
      'Payment Type',
      'Paid Amount (PKR)',
      'Payment Method',
      'Clearance Status',
      'Remarks / Description',
    ];
    const rows = filteredRows.map(({ customer, entry }) => {
      const isPending = entry.method === 'Bank' || entry.method === 'Bank Transfer';
      return [
        entry.id || entry.reference || '-',
        entry.date || '-',
        customer.id || '-',
        customer.name || '-',
        customer.phone || '-',
        entry.type || 'Payment',
        Number(entry.credit || 0),
        entry.method || 'Cash',
        isPending ? 'Pending' : 'Confirmed',
        entry.notes || entry.description || '-',
      ];
    });
    const totalCollected = filteredRows.reduce((sum, { entry }) => sum + (Number(entry.credit) || 0), 0);

    exportTableToCSV({
      filename: `Customer_Collections_Receipts_${new Date().toISOString().split('T')[0]}`,
      title: 'Customer Payments & Collections Register',
      metadata: [
        ['Status Filter', statusFilter],
        ['Search Query', searchQuery || 'All Receipts'],
        ['Total Receipts Filtered', filteredRows.length],
        ['Total Amount Collected', `Rs. ${totalCollected.toLocaleString()}`],
      ],
      headers,
      rows,
      summaryRows: [
        ['SUMMARY TOTALS', '', '', '', '', 'Total Collections', `Rs. ${totalCollected.toLocaleString()}`, '', '', `Receipts: ${filteredRows.length}`],
      ],
    });
  };

  return (
    <div className="space-y-2">
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by customer name, reference, or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-md text-xs focus-visible:border-emerald-500 focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-44">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
            >
              <SelectTrigger className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-700 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status" className="text-xs">All Status</SelectItem>
                <SelectItem value="Confirmed" className="text-xs">Confirmed</SelectItem>
                <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 px-3 text-xs font-semibold text-emerald-800 hover:text-emerald-950 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 shadow-2xs cursor-pointer gap-1.5 shrink-0"
            title="Export filtered collection receipts to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
          <Table className="w-full text-left border-collapse min-w-[900px]">
            <TableHeader className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
              <TableRow className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50">
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">DATE &amp; REF</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">CUSTOMER ACCOUNT</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-center text-slate-400 font-bold">PAYMENT TYPE</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">PAID AMOUNT</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">PAYMENT METHOD</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-center text-slate-400 font-bold">STATUS</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">REMARKS</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-3.5 py-8 text-center text-slate-400 font-medium">
                    No collection recovery records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map(({ customer, entry }, idx) => {
                  const refCode = entry.ref || (entry.id ? `TXN-${String(entry.id).slice(-4)}` : `VCH-${idx + 1}`);
                  const isPending = entry.method === 'Bank' || entry.method === 'Bank Transfer';
                  const paymentType = Number(entry.credit) >= 5000 ? 'Full Payment' : 'Partial Payment';

                  return (
                    <TableRow
                      key={entry.id || idx}
                      onClick={() => onViewReceipt && onViewReceipt(customer, entry)}
                      title={`Click to view payment receipt for ${customer.name}`}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group select-none"
                    >
                      <TableCell className="px-3.5 py-2 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-700 font-semibold tabular">{entry.date}</div>
                        <div className="text-[10px] font-mono text-slate-400 tabular">{refCode}</div>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 whitespace-nowrap">
                        <div className="font-bold text-slate-800 group-hover:text-blue-950 leading-tight transition-colors font-display">
                          {customer.name}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight tabular">{customer.phone} · {customer.area || 'Model Town'}</div>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                          {paymentType}
                        </span>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right font-black text-emerald-600 whitespace-nowrap tabular">
                        Rs. {Number(entry.credit || 0).toLocaleString()}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 font-medium text-slate-700 whitespace-nowrap">
                        {entry.method || 'Cash'}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isPending
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          }`}
                        >
                          {isPending ? 'Pending' : 'Confirmed'}
                        </span>
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-slate-500 max-w-[200px] truncate">
                        {entry.notes || entry.description || 'Payment cleared'}
                      </TableCell>

                      <TableCell className="px-3.5 py-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewReceipt) onViewReceipt(customer, entry);
                            }}
                            title="View Payment Receipt"
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
          </Table>
        </div>
      </div>
    </div>
  );
}

