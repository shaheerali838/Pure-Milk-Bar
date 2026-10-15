import React from 'react';
import {
  Banknote,
  Smartphone,
  Coins,
  Receipt,
  Layers,
  CreditCard,
} from 'lucide-react';

export default function DoorstepPaymentModes({
  isOntimeDelivery,
  settlementMode,
  setSettlementMode,
  balanceDue,
  halfCashAmount,
  setHalfCashAmount,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          <span>DOORSTEP PAYMENT RECEIVED FROM CUSTOMER:</span>
        </label>
        {isOntimeDelivery && (
          <span className="text-[10px] text-slate-500 font-medium">
            Full Cash or Online Payment Only
          </span>
        )}
      </div>

      {/* If On-Time Delivery: Show only Full Cash and Online Payment */}
      {isOntimeDelivery ? (
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Full Cash (100%) */}
          <button
            type="button"
            onClick={() => setSettlementMode('full_cash')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              settlementMode === 'full_cash'
                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Full Cash (100%)</span>
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 font-mono font-black text-base text-emerald-700">
              Rs. {balanceDue.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Rider collected full cash</span>
          </button>

          {/* 2. Online Payment (EasyPaisa / JazzCash) */}
          <button
            type="button"
            onClick={() => setSettlementMode('online')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              settlementMode === 'online'
                ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Online Payment</span>
              <Smartphone className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 font-mono font-black text-base text-indigo-700">
              Rs. {balanceDue.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">EasyPaisa / JazzCash</span>
          </button>
        </div>
      ) : (
        /* If Monthly Delivery: Show all 6 settlement options */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* 1. Full Cash */}
          <button
            type="button"
            onClick={() => setSettlementMode('full_cash')}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              settlementMode === 'full_cash'
                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Full Cash (100%)</span>
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1 font-mono font-black text-sm text-emerald-700">
              Rs. {balanceDue.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Rider collected full amount</span>
          </button>

          {/* 2. Half Cash */}
          <button
            type="button"
            onClick={() => {
              setSettlementMode('half_cash');
              if (!halfCashAmount) {
                setHalfCashAmount(String(Math.round(balanceDue / 2)));
              }
            }}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              settlementMode === 'half_cash'
                ? 'border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Half Cash (50%)</span>
              <Coins className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-1 font-mono font-black text-sm text-amber-700">
              Rs. {Math.round(balanceDue / 2).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">50% Cash, rest to Khata</span>
          </button>

          {/* 3. Custom Cash */}
          <button
            type="button"
            onClick={() => setSettlementMode('custom_cash')}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              settlementMode === 'custom_cash'
                ? 'border-blue-500 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Custom Cash</span>
              <Receipt className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-1 font-mono font-black text-sm text-blue-700">
              Enter Amount
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Partial cash, rest to Khata</span>
          </button>

          {/* 4. Online Payment */}
          <button
            type="button"
            onClick={() => setSettlementMode('online')}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              settlementMode === 'online'
                ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Online Payment</span>
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="mt-1 font-mono font-black text-sm text-indigo-700">
              Rs. {balanceDue.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Digital payment to account</span>
          </button>

          {/* 5. Split (Cash + Online) */}
          <button
            type="button"
            onClick={() => setSettlementMode('split')}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              settlementMode === 'split'
                ? 'border-teal-500 bg-teal-50/80 text-teal-950 ring-2 ring-teal-500/20 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Split (Cash+Online)</span>
              <Layers className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="mt-1 font-mono font-black text-sm text-teal-700">
              Dual Payment
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Cash + Online</span>
          </button>

          {/* 6. On Khata */}
          <button
            type="button"
            onClick={() => setSettlementMode('khata')}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              settlementMode === 'khata'
                ? 'border-purple-500 bg-purple-50/80 text-purple-950 ring-2 ring-purple-500/20 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">On Khata (0% Now)</span>
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="mt-1 font-mono font-black text-sm text-purple-700">
              Rs. 0 Collected
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Full balance to Khata</span>
          </button>
        </div>
      )}
    </div>
  );
}
