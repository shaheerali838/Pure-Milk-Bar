import { X, Phone, MapPin } from 'lucide-react';
import { useLedgerContext } from '../../../../context/LedgerContext';

export default function CustomerFinanceDetailModal({ customer, isOpen, onClose }) {
  const { getLedgerForCustomer } = useLedgerContext();

  if (!isOpen || !customer) return null;

  const entries = getLedgerForCustomer(customer.id) || [];
  const outstanding = Math.max(0, Number(customer?.khataBalance || 0));
  const totalPaid = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';
  const custCode = `CUST-${String(customer.id).slice(-4)}`;

  const lastTxn = entries.length > 0 ? entries[entries.length - 1] : null;
  const lastTxnDate = lastTxn ? lastTxn.date : (customer.createdAt || new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Customer Financial Ledger — {customer.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Account ID: <span className="font-mono">{custCode}</span> · Area: {customer.area || 'Model Town'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
          {/* 1. Dark Hero Card */}
          <div className="bg-[#0b1b1a] p-4 sm:p-5 rounded-2xl text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#0d3b36] text-[#2dd4bf] font-extrabold flex items-center justify-center text-xl shrink-0 border border-[#134e48]">
                {initial}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white leading-tight">{customer.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#134e48] text-emerald-300 border border-[#0d3b36]">
                    {customer.status || 'Active'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {customer.phone}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {customer.address || `Street 4, House 18, ${customer.area || 'Model Town'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Khata Balance Due */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                KHATA BALANCE DUE (PKR)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#ff6b81] tracking-tight mt-0.5 font-mono">
                Rs. {outstanding.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 2. 3 Stat Boxes Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Paid */}
            <div className="bg-[#f0fdf4] border border-emerald-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                TOTAL PAID TO DATE (PKR)
              </span>
              <div className="text-lg font-black text-emerald-950 mt-1 font-mono">
                Rs. {totalPaid.toLocaleString()}
              </div>
            </div>

            {/* Outstanding Credit */}
            <div className="bg-[#fff1f2] border border-rose-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                OUTSTANDING CREDIT (PKR)
              </span>
              <div className="text-lg font-black text-rose-900 mt-1 font-mono">
                Rs. {outstanding.toLocaleString()}
              </div>
            </div>

            {/* Last Transaction Date */}
            <div className="bg-[#f5f3ff] border border-indigo-100 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                LAST TRANSACTION DATE
              </span>
              <div className="text-lg font-black text-indigo-950 mt-1 font-mono">
                {lastTxnDate}
              </div>
            </div>
          </div>

          {/* 3. Transaction History Table Header */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">
              Financial Transaction History &amp; Ledgers
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {entries.length} records found
            </span>
          </div>

          {/* 4. Ledger Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">DATE &amp; REF</th>
                    <th className="px-3.5 py-2.5">TYPE</th>
                    <th className="px-3.5 py-2.5 text-right">TOTAL DUE</th>
                    <th className="px-3.5 py-2.5 text-right">AMOUNT PAID</th>
                    <th className="px-3.5 py-2.5 text-right">REMAINING</th>
                    <th className="px-3.5 py-2.5 text-center">STATUS</th>
                    <th className="px-3.5 py-2.5">METHOD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3.5 py-8 text-center text-slate-400">
                        No transaction records found for this customer.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry, idx) => {
                      const refCode = entry.ref || (entry.id ? `TXN-${String(entry.id).slice(-4)}` : `TXN-${1000 + idx}`);
                      const credit = Number(entry.credit) || 0;
                      const debit = Number(entry.debit) || 0;
                      const runningBal = Number(entry.runningBalance) || 0;
                      const totalDueBefore = runningBal + credit;

                      let typeLabel = 'Custom Amount';
                      if (entry.type === 'OPENING') typeLabel = 'Opening Balance';
                      else if (credit > 0 && runningBal === 0) typeLabel = 'Full Payment';
                      else if (credit > 0 && totalDueBefore > 0 && Math.abs(credit - Math.round(totalDueBefore / 2)) < 5) typeLabel = 'Half Payment (50%)';
                      else if (credit > 0) typeLabel = 'Partial Payment';
                      else if (debit > 0) typeLabel = 'Debit Charge';

                      const isPaid = credit > 0 && runningBal === 0;
                      const isPartial = credit > 0 && runningBal > 0;

                      return (
                        <tr key={entry.id || idx} className="hover:bg-slate-50/70 transition-colors">
                          {/* Date & Ref */}
                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            <div className="font-mono text-slate-800 font-semibold text-[11px]">{entry.date}</div>
                            <div className="text-[10px] font-mono text-blue-600 font-bold">{refCode}</div>
                          </td>

                          {/* Type Badge */}
                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                              {typeLabel}
                            </span>
                          </td>

                          {/* Total Due */}
                          <td className="px-3.5 py-2.5 text-right font-medium text-slate-800 whitespace-nowrap font-mono">
                            Rs. {totalDueBefore > 0 ? totalDueBefore.toLocaleString() : (debit > 0 ? debit.toLocaleString() : '—')}
                          </td>

                          {/* Amount Paid */}
                          <td className="px-3.5 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap font-mono">
                            {credit > 0 ? `Rs. ${credit.toLocaleString()}` : '—'}
                          </td>

                          {/* Remaining */}
                          <td className="px-3.5 py-2.5 text-right font-bold text-[#ff4d6d] whitespace-nowrap font-mono">
                            Rs. {runningBal.toLocaleString()}
                          </td>

                          {/* Status */}
                          <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isPartial
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending'}
                            </span>
                          </td>

                          {/* Method */}
                          <td className="px-3.5 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                            {entry.method || 'Cash'}
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/70 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold transition text-xs cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
