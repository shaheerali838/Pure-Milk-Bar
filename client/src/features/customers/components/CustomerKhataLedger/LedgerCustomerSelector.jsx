import React from 'react';
import { Eye, Plus, CheckCircle2, Calendar } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function LedgerCustomerSelector({
  selectedCustomerId,
  onSelectCustomer,
  selectedMonth,
  onChangeMonth,
  onViewCustomerDetails,
  onOpenAddDebit,
  onOpenRecordPayment,
  onSettleKhata,
}) {
  const { customers } = useCustomerContext();

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-2 mb-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
        {/* Customer Select Dropdown */}
        <div className="md:col-span-8">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Select Customer Khata
          </label>
          <select
            value={selectedCustomerId || ''}
            onChange={(e) => onSelectCustomer(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {customers.length === 0 ? (
              <option value="">No customers available - Add a customer first</option>
            ) : (
              customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — Balance: Rs. {(c.khataBalance || 0).toLocaleString()} (Due)
                </option>
              ))
            )}
          </select>
        </div>

        {/* Month Selector */}
        <div className="md:col-span-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 text-slate-400" /> Month
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onChangeMonth(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
        <button
          onClick={onViewCustomerDetails}
          disabled={!selectedCustomerId}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
        >
          <Eye className="w-3 h-3 text-slate-500" />
          Customer Details
        </button>

        <button
          onClick={onOpenAddDebit}
          disabled={!selectedCustomerId}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add Manual Debit
        </button>

        <button
          onClick={onOpenRecordPayment}
          disabled={!selectedCustomerId}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Record Payment
        </button>

        <button
          onClick={onSettleKhata}
          disabled={!selectedCustomerId}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#00a86b] hover:bg-[#00925d] text-white text-[11px] font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle2 className="w-3 h-3" />
          Settle &amp; Clear Full Khata
        </button>
      </div>
    </div>
  );
}
