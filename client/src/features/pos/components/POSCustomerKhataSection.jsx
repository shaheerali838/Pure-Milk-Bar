import React from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePOSContext } from '@/context/POSContext';
import POSCustomerSelect from './POSCustomerSelect';

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
    splitDetails = {},
    setSplitDetails,
    onlineDetails = {},
    setOnlineDetails,
    orderNotes = '',
    setOrderNotes,
    cashTendered = '',
    setCashTendered,
    netPayable = 0,
    executeKhataPayment,
  } = usePOSContext();

  const currentKhataBal = Number(activeCustomer?.khataBalance || 0);
  const creditLimit = Number(activeCustomer?.creditLimit || 0);
  const totalDirect =
    khataPaymentOption === 'cash' || khataPaymentOption === 'easypaisa' || khataPaymentOption === 'jazzcash'
      ? netPayable
      : khataPaymentOption === 'split'
      ? (Number(splitDetails?.cash || 0) + Number(splitDetails?.easyPaisa || 0) + Number(splitDetails?.jazzCash || 0))
      : (parseFloat(partialPaidAmount) || 0);

  const projectedCustomerBalance =
    khataPaymentOption === 'khata'
      ? currentKhataBal + netPayable
      : currentKhataBal + Math.max(0, netPayable - totalDirect);

  const isLimitExceeded = creditLimit > 0 && (currentKhataBal >= creditLimit || projectedCustomerBalance > creditLimit);

  const handleDirectClearKhata = (cust) => {
    const target = cust || activeCustomer;
    if (!target) return;
    const balance = target.khataBalance || 0;
    if (balance <= 0) {
      toast.info(`Customer ${target.name} has no outstanding khata debt.`);
      return;
    }
    if (
      window.confirm(
        `Clear and finish full khata debt of Rs. ${balance.toLocaleString()} for ${target.name}?`,
      )
    ) {
      executeKhataPayment?.({
        customerId: target.id,
        amountPaid: balance,
        paymentMethod: "Cash",
        notes: "Full Khata finished and cleared at POS register",
      });
      toast.success(`Khata for ${target.name} has been settled and finished.`);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150 text-xs">
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          Customer Account (Khata)
        </label>
        <POSCustomerSelect
          value={linkedCustomerId}
          onChange={setLinkedCustomerId}
          customers={registeredCustomers}
        />
      </div>

      {activeCustomer ? (
        <div className="space-y-2.5">
          {/* Customer Profile Banner with Clear Due */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 text-xs block">
                {activeCustomer.name}
              </span>
              <span className="text-[10px] text-slate-500">
                {activeCustomer.phone} &bull; {activeCustomer.area || "Model Town"}
              </span>
            </div>
            {activeCustomer.khataBalance > 0 && (
              <button
                type="button"
                onClick={() => handleDirectClearKhata(activeCustomer)}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-white border border-rose-200 rounded px-2 py-0.5 shadow-2xs transition cursor-pointer"
              >
                Clear Due
              </button>
            )}
          </div>
          {/* Credit Limit Exceeded Alert Notification */}
          {isLimitExceeded && (
            <div className="p-2.5 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start gap-2 text-rose-900 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950 flex items-center gap-1">
                  <span>⚠️ Credit Limit Exceeded Notice!</span>
                </p>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  Customer credit limit is <span className="font-black font-mono">PKR {creditLimit.toLocaleString()}</span>. 
                  {currentKhataBal >= creditLimit ? (
                    <> Dues already reached <span className="font-black font-mono text-rose-950">PKR {currentKhataBal.toLocaleString()}</span>.</>
                  ) : (
                    <> This order will raise balance to <span className="font-black font-mono text-rose-950">PKR {projectedCustomerBalance.toLocaleString()}</span>.</>
                  )}
                </p>
              </div>
            </div>
          )}

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

            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition-all ${
                  khataPaymentOption === 'khata'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="khataPaymentOption"
                    value="khata"
                    checked={khataPaymentOption === 'khata'}
                    onChange={() => setKhataPaymentOption('khata')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold">Charge on Khata</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal mt-1">
                  Full amount debited to customer's monthly ledger
                </span>
              </label>

              <label
                className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition-all ${
                  khataPaymentOption === 'cash'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="khataPaymentOption"
                    value="cash"
                    checked={khataPaymentOption === 'cash'}
                    onChange={() => setKhataPaymentOption('cash')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold">Cash</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal mt-1">
                  Customer pays cash at counter
                </span>
              </label>
            </div>

            {khataPaymentOption === 'cash' && (
              <div className="space-y-1.5 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                    Amount Received (Rs)
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">
                    Bill: <span className="text-slate-800 font-bold">Rs. {netPayable.toLocaleString()}</span>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs font-black text-emerald-700">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={cashTendered}
                    onChange={(e) => setCashTendered?.(e.target.value)}
                    placeholder="e.g. 500, 1000..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-emerald-600 tabular"
                  />
                </div>
                {Number(cashTendered) > 0 && (
                  <div
                    className={`p-1.5 rounded-lg border flex justify-between items-center text-xs font-bold ${
                      Number(cashTendered) - netPayable > 0
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : Number(cashTendered) < netPayable
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <span>
                      {Number(cashTendered) - netPayable > 0
                        ? '💵 Change / Return:'
                        : Number(cashTendered) < netPayable
                        ? '⚠️ Shortage / Due:'
                        : '✓ Exact Cash Received:'}
                    </span>
                    <span className="tabular font-black">
                      Rs.{' '}
                      {Number(cashTendered) - netPayable > 0
                        ? (Number(cashTendered) - netPayable).toLocaleString()
                        : Number(cashTendered) < netPayable
                        ? (netPayable - Number(cashTendered)).toLocaleString()
                        : '0'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Order Memo / Subscription Note (Optional)..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
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
