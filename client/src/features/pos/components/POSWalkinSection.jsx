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

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              paymentMethod === 'cash'
                ? 'bg-[#009966] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash Payment</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('online')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              paymentMethod === 'online'
                ? 'bg-[#2563eb] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Online (EasyPaisa/JazzCash)</span>
          </button>
        </div>

        {paymentMethod === 'cash' && (
          <div className="space-y-1.5 pt-1">
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
              <input
                type="number"
                min="0"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 tabular"
              />
            </div>

            <div className="grid grid-cols-5 gap-1">
              {cashChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setCashTendered(String(chip.value))}
                  className="py-1 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 transition cursor-pointer text-center tabular"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {changeDue > 0 && (
              <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center text-xs font-bold text-emerald-800">
                <span>Change Due:</span>
                <span className="tabular">Rs. {changeDue.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'online' && (
          <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900 uppercase">Gateway</span>
              <select
                value={onlineDetails.provider}
                onChange={(e) =>
                  setOnlineDetails({ ...onlineDetails, provider: e.target.value })
                }
                className="bg-white border border-blue-200 rounded px-2 py-0.5 text-xs font-bold text-blue-800"
              >
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Raast">Raast Instant</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Sender Mobile #"
                value={onlineDetails.senderAccount}
                onChange={(e) =>
                  setOnlineDetails({ ...onlineDetails, senderAccount: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
              />
              <input
                type="text"
                placeholder="TRX ID #"
                value={onlineDetails.trxId}
                onChange={(e) =>
                  setOnlineDetails({ ...onlineDetails, trxId: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
