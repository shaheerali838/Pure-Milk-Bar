import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSCustomerKhataSection() {
  const {
    linkedCustomerId,
    setLinkedCustomerId,
    activeCustomer,
    registeredCustomers = [],
    khataPaymentOption = 'khata',
    setKhataPaymentOption,
    partialPaidAmount = '',
    setPartialPaidAmount,
    orderNotes = '',
    setOrderNotes,
    netPayable = 0,
  } = usePOSContext();

  const currentKhataBal = Number(activeCustomer?.khataBalance || 0);
  const projectedCustomerBalance =
    khataPaymentOption === 'khata'
      ? currentKhataBal + netPayable
      : khataPaymentOption === 'cash'
      ? currentKhataBal
      : currentKhataBal + Math.max(0, netPayable - (parseFloat(partialPaidAmount) || 0));

  return (
    <div className="space-y-3 animate-in fade-in duration-150 text-xs">
      <div>
        <label className="block text-[10px] font-bold text-purple-900 uppercase mb-1">
          Select Monthly Subscribed Customer:
        </label>
        <div className="relative">
          <select
            value={linkedCustomerId}
            onChange={(e) => setLinkedCustomerId(e.target.value)}
            className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 pr-8 appearance-none"
          >
            <option value="">— Choose Customer Account —</option>
            {registeredCustomers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name} ({cust.phone}) — {cust.area || 'Model Town'} (Khata: Rs. {(cust.khataBalance || 0).toLocaleString()})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {activeCustomer ? (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-center">
              <span className="text-[9px] font-bold text-rose-700 uppercase block">Current Due</span>
              <div className="text-xs font-black text-rose-800 tabular mt-0.5">
                Rs. {currentKhataBal.toLocaleString()}
              </div>
            </div>

            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <span className="text-[9px] font-bold text-blue-700 uppercase block">This Sale</span>
              <div className="text-xs font-black text-blue-800 tabular mt-0.5">
                Rs. {netPayable.toLocaleString()}
              </div>
            </div>

            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <span className="text-[9px] font-bold text-emerald-700 uppercase block">New Balance</span>
              <div className="text-xs font-black text-emerald-800 tabular mt-0.5">
                Rs. {projectedCustomerBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Khata &amp; Payment Settlement
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              <label
                className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                  khataPaymentOption === 'khata'
                    ? 'border-purple-500 bg-purple-50/60 text-purple-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="khataPaymentOption"
                    value="khata"
                    checked={khataPaymentOption === 'khata'}
                    onChange={() => setKhataPaymentOption('khata')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs">Charge Khata</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal mt-0.5">Full on ledger</span>
              </label>

              <label
                className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                  khataPaymentOption === 'cash'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="khataPaymentOption"
                    value="cash"
                    checked={khataPaymentOption === 'cash'}
                    onChange={() => setKhataPaymentOption('cash')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs">Paid in Cash</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal mt-0.5">Immediate full pay</span>
              </label>

              <label
                className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                  khataPaymentOption === 'partial'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="khataPaymentOption"
                    value="partial"
                    checked={khataPaymentOption === 'partial'}
                    onChange={() => setKhataPaymentOption('partial')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs">Partial Pay</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal mt-0.5">Part cash, part khata</span>
              </label>
            </div>

            {khataPaymentOption === 'partial' && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <label className="block text-[10px] font-bold text-amber-900 uppercase">
                  Cash Paid Now (Rs.):
                </label>
                <input
                  type="number"
                  min="1"
                  max={netPayable}
                  value={partialPaidAmount}
                  onChange={(e) => setPartialPaidAmount(e.target.value)}
                  placeholder="Enter value"
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 tabular"
                />
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Order Memo / Subscription Note (Optional)..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Please select a registered customer above to apply monthly subscription &amp; Khata buy logic.</span>
        </div>
      )}
    </div>
  );
}
