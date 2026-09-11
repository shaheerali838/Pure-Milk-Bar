import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';

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

export default function CollectionPayoutsTable({ onViewReceipt }) {
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

  return (
    <div className="space-y-2.5">
      {/* Search & Filter Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, reference, or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
          />
        </div>

        <div className="w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-emerald-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Main Collections Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-3.5 py-2">DATE &amp; REF</th>
                <th className="px-3.5 py-2">CUSTOMER ACCOUNT</th>
                <th className="px-3.5 py-2 text-center">PAYMENT TYPE</th>
                <th className="px-3.5 py-2 text-right">PAID AMOUNT</th>
                <th className="px-3.5 py-2">PAYMENT METHOD</th>
                <th className="px-3.5 py-2 text-center">STATUS</th>
                <th className="px-3.5 py-2">REMARKS</th>
                <th className="px-3.5 py-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3.5 py-8 text-center text-slate-400 font-medium">
                    No collection recovery records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ customer, entry }, idx) => {
                  const refCode = entry.ref || (entry.id ? `TXN-${String(entry.id).slice(-4)}` : `VCH-${idx + 1}`);
                  const isPending = entry.method === 'Bank' || entry.method === 'Bank Transfer';
                  const paymentType = Number(entry.credit) >= 5000 ? 'Full Payment' : 'Partial Payment';

                  return (
                    <tr key={entry.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date & Ref */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-700 font-semibold">{entry.date}</div>
                        <div className="text-[10px] font-mono text-slate-400">{refCode}</div>
                      </td>

                      {/* Customer Account */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <div className="font-bold text-slate-800 leading-tight">{customer.name}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{customer.phone} · {customer.area || 'Model Town'}</div>
                      </td>

                      {/* Payment Type */}
                      <td className="px-3.5 py-2 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                          {paymentType}
                        </span>
                      </td>

                      {/* Paid Amount */}
                      <td className="px-3.5 py-2 text-right font-black text-emerald-600 whitespace-nowrap">
                        Rs. {Number(entry.credit || 0).toLocaleString()}
                      </td>

                      {/* Payment Method */}
                      <td className="px-3.5 py-2 font-medium text-slate-700 whitespace-nowrap">
                        {entry.method || 'Cash'}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-2 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isPending
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          }`}
                        >
                          {isPending ? 'Pending' : 'Confirmed'}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="px-3.5 py-2 text-slate-500 max-w-[200px] truncate">
                        {entry.notes || entry.description || 'Payment cleared'}
                      </td>

                      {/* Action */}
                      <td className="px-3.5 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => onViewReceipt(customer, entry)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition cursor-pointer border border-slate-200"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
