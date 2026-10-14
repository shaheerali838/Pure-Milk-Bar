import React from 'react';
import { Banknote, Smartphone } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSWalkinSection() {
  const {
    walkinName = '',
    setWalkinName,
    walkinPhone = '',
    setWalkinPhone,
    paymentMethod = 'cash',
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    netPayable = 0,
    onlineDetails,
    setOnlineDetails,
  } = usePOSContext();

  const numCashTendered = Number(cashTendered) || 0;
  const changeDue = Math.max(0, numCashTendered - netPayable);

  const cashChips = [
    { label: 'Exact', value: netPayable },
    { label: 'Rs. 500', value: 500 },
    { label: 'Rs. 1,000', value: 1000 },
    { label: 'Rs. 2,000', value: 2000 },
    { label: 'Rs. 5,000', value: 5000 },
  ];

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2 text-xs">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Walk-in Customer Details (Optional)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              placeholder="Customer Name (Optional)"
              value={walkinName}
              onChange={(e) => setWalkinName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Phone Number (Optional)"
              value={walkinPhone}
              onChange={(e) => setWalkinPhone(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 tabular"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider">
          <span>PAYMENT METHOD</span>
          <span className="text-slate-600 capitalize">{paymentMethod}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
              paymentMethod === 'cash'
                ? 'bg-[#009966] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod('easypaisa');
              setOnlineDetails((prev) => ({ ...prev, provider: 'EasyPaisa' }));
            }}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
              paymentMethod === 'easypaisa'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>EasyPaisa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod('jazzcash');
              setOnlineDetails((prev) => ({ ...prev, provider: 'JazzCash' }));
            }}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
              paymentMethod === 'jazzcash'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>JazzCash</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('split')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
              paymentMethod === 'split'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Split Pay</span>
          </button>
        </div>

        {paymentMethod === 'cash' && (
          <div className="space-y-2 pt-1 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  Amount Received (Rs)
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  Bill: <span className="text-slate-800 font-extrabold tabular">Rs. {netPayable.toLocaleString()}</span>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs font-black text-emerald-700">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder="e.g. 500, 1000..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {cashChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setCashTendered(String(chip.value))}
                  className="py-1 px-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded text-[10px] font-bold text-slate-700 hover:text-emerald-800 transition cursor-pointer text-center tabular shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {numCashTendered > 0 && (
              <div
                className={`p-2 rounded-lg border flex justify-between items-center text-xs font-bold ${
                  changeDue > 0
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : numCashTendered < netPayable
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <span>
                  {changeDue > 0
                    ? '💵 Change / Return:'
                    : numCashTendered < netPayable
                    ? '⚠️ Shortage / Due:'
                    : '✓ Exact Cash Received:'}
                </span>
                <span className="text-xs font-black tabular">
                  Rs.{' '}
                  {changeDue > 0
                    ? changeDue.toLocaleString()
                    : numCashTendered < netPayable
                    ? (netPayable - numCashTendered).toLocaleString()
                    : '0'}
                </span>
              </div>
            )}
          </div>
        )}

        {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash' || paymentMethod === 'online') && (
          <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900 uppercase">
                {paymentMethod === 'easypaisa' ? 'EasyPaisa Online' : paymentMethod === 'jazzcash' ? 'JazzCash Online' : 'Online Gateway'}
              </span>
              <span className="font-bold text-blue-900 font-mono">Total: Rs. {netPayable.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Sender Mobile #"
                value={onlineDetails?.senderAccount || ''}
                onChange={(e) =>
                  setOnlineDetails({ ...onlineDetails, senderAccount: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
              />
              <input
                type="text"
                placeholder="TRX ID #"
                value={onlineDetails?.trxId || ''}
                onChange={(e) =>
                  setOnlineDetails({ ...onlineDetails, trxId: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'split' && (
          <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-purple-900 uppercase">
              <span>Split Payment Allocation</span>
              <span>Bill: Rs. {netPayable.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Cash Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={splitDetails?.cash || ''}
                  onChange={(e) => setSplitDetails((prev) => ({ ...prev, cash: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold tabular"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-emerald-700 block mb-0.5">EasyPaisa</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={splitDetails?.easyPaisa || ''}
                  onChange={(e) => setSplitDetails((prev) => ({ ...prev, easyPaisa: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold tabular"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-amber-700 block mb-0.5">JazzCash</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={splitDetails?.jazzCash || ''}
                  onChange={(e) => setSplitDetails((prev) => ({ ...prev, jazzCash: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold tabular"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
