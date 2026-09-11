import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';

export default function CustomerFinanceLedgerTable({ onViewDetail }) {
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
      {/* Search & Filter Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
          />
        </div>

        <div className="w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-emerald-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="All Financial Status">All Financial Status</option>
            <option value="Paid Up">Paid Up</option>
            <option value="Half-Paid">Half-Paid</option>
            <option value="Credit Overdue">Credit Overdue</option>
          </select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-3.5 py-2">CUSTOMER</th>
                <th className="px-3.5 py-2">AREA &amp; CONTACT</th>
                <th className="px-3.5 py-2 text-right">CREDIT LIMIT</th>
                <th className="px-3.5 py-2 text-right">TOTAL PAID</th>
                <th className="px-3.5 py-2 text-right">CREDIT (OUTSTANDING)</th>
                <th className="px-3.5 py-2">LAST PAYMENT / STATUS</th>
                <th className="px-3.5 py-2 text-center">OVERALL STATUS</th>
                <th className="px-3.5 py-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3.5 py-8 text-center text-slate-400 font-medium">
                    No customers found matching search and filter.
                  </td>
                </tr>
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
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Customer */}
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 leading-tight">{customer.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 leading-tight">{custCode}</div>
                          </div>
                        </div>
                      </td>

                      {/* Area & Contact */}
                      <td className="px-3.5 py-2">
                        <div className="font-semibold text-slate-800 leading-tight">{customer.phone}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{customer.area || 'Model Town'}</div>
                      </td>

                      {/* Credit Limit */}
                      <td className="px-3.5 py-2 text-right font-bold text-slate-700 whitespace-nowrap">
                        Rs. {(customer.creditLimit || 10000).toLocaleString()}
                      </td>

                      {/* Total Paid */}
                      <td className="px-3.5 py-2 text-right font-bold text-emerald-600 whitespace-nowrap">
                        Rs. {totalPaid.toLocaleString()}
                      </td>

                      {/* Credit (Outstanding) */}
                      <td className="px-3.5 py-2 text-right font-black whitespace-nowrap">
                        {outstanding === 0 ? (
                          <span className="text-emerald-600">Cleared (Rs. 0)</span>
                        ) : (
                          <span className="text-rose-600">Rs. {outstanding.toLocaleString()}</span>
                        )}
                      </td>

                      {/* Last Payment / Status */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-600">{lastPaymentDate}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/60 text-[9px] font-semibold">
                          {lastPaymentLabel}
                        </span>
                      </td>

                      {/* Overall Status */}
                      <td className="px-3.5 py-2 text-center whitespace-nowrap">
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
                      </td>

                      {/* Action */}
                      <td className="px-3.5 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => onViewDetail(customer)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition cursor-pointer border border-slate-200"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>View Detail</span>
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
