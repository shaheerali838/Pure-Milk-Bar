import React from 'react';
import { CreditCard } from 'lucide-react';
import CustomSelect from '@/components/common/CustomSelect';

export default function DoorstepPaymentInputs({
  settlementMode,
  isOntimeDelivery,
  balanceDue,
  halfCashAmount,
  setHalfCashAmount,
  customCashAmount,
  setCustomCashAmount,
  onlineAmount,
  setOnlineAmount,
  onlineProvider,
  setOnlineProvider,
  onlineSenderAccount,
  setOnlineSenderAccount,
  onlineTrxId,
  setOnlineTrxId,
  splitCashAmount,
  setSplitCashAmount,
  splitOnlineAmount,
  setSplitOnlineAmount,
  settlementNotes,
  setSettlementNotes,
}) {
  const providerOptions = [
    { value: 'EasyPaisa', label: 'EasyPaisa' },
    { value: 'JazzCash', label: 'JazzCash' },
  ];

  return (
    <div className="space-y-3">
      {/* Half Cash Amount Input */}
      {settlementMode === 'half_cash' && !isOntimeDelivery && (
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-amber-900">
              Half Cash Amount Received by Rider (Rs.):
            </label>
            <button
              type="button"
              onClick={() => setHalfCashAmount(String(Math.round(balanceDue / 2)))}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-bold cursor-pointer border border-amber-300"
            >
              Reset 50% (Rs. {Math.round(balanceDue / 2)})
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
            <input
              type="number"
              min="0"
              max={balanceDue}
              value={halfCashAmount}
              onChange={(e) => setHalfCashAmount(e.target.value)}
              placeholder="Enter half amount"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-amber-600"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-800 font-medium">
            <span>Remaining to Khata:</span>
            <span className="font-mono font-bold">
              Rs. {Math.max(0, balanceDue - (parseFloat(halfCashAmount) || 0)).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Custom Cash Amount Input */}
      {settlementMode === 'custom_cash' && !isOntimeDelivery && (
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-blue-900">
            Custom Cash Amount Received by Rider (Rs.):
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
            <input
              type="number"
              min="0"
              max={balanceDue}
              value={customCashAmount}
              onChange={(e) => setCustomCashAmount(e.target.value)}
              placeholder="Enter custom cash amount"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-blue-800 font-medium">
            <span>Remaining Charged to Khata:</span>
            <span className="font-mono font-bold">
              Rs. {Math.max(0, balanceDue - (parseFloat(customCashAmount) || 0)).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Online Details (EasyPaisa & JazzCash) */}
      {settlementMode === 'online' && (
        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
              Online Account / Digital Receipt
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOnlineProvider('EasyPaisa')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  onlineProvider === 'EasyPaisa'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                EasyPaisa
              </button>
              <button
                type="button"
                onClick={() => setOnlineProvider('JazzCash')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  onlineProvider === 'JazzCash'
                    ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                JazzCash
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-0.5">
                Total Online Amount:
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  max={balanceDue}
                  value={onlineAmount}
                  onChange={(e) => setOnlineAmount(e.target.value)}
                  placeholder="Online Amount"
                  className="w-full pl-8 pr-2 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-0.5">
                Sender Mobile # (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. 0300-1234567"
                value={onlineSenderAccount}
                onChange={(e) => setOnlineSenderAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-0.5">
              Transaction / TID / Reference ID (Optional):
            </label>
            <input
              type="text"
              placeholder="Enter EasyPaisa / JazzCash TID..."
              value={onlineTrxId}
              onChange={(e) => setOnlineTrxId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>
      )}

      {/* Split Cash + Online Inputs */}
      {settlementMode === 'split' && !isOntimeDelivery && (
        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2.5 animate-in fade-in duration-150">
          <span className="text-xs font-bold text-teal-950 uppercase tracking-wide block">
            Dual Payment Breakdown
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-teal-900 uppercase mb-0.5">
                Rider Cash Amount:
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  max={balanceDue}
                  value={splitCashAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSplitCashAmount(val);
                    const c = parseFloat(val) || 0;
                    setSplitOnlineAmount(String(Math.max(0, balanceDue - c)));
                  }}
                  className="w-full pl-8 pr-2 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-teal-900 uppercase mb-0.5">
                Online Amount ({onlineProvider}):
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  max={balanceDue}
                  value={splitOnlineAmount}
                  onChange={(e) => setSplitOnlineAmount(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 items-center">
            <CustomSelect
              value={onlineProvider}
              onChange={(val) => setOnlineProvider(val)}
              options={providerOptions}
              placeholder="Select Provider"
            />
            <input
              type="text"
              placeholder="Online TID (Optional)"
              value={onlineTrxId}
              onChange={(e) => setOnlineTrxId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Full Khata notice */}
      {settlementMode === 'khata' && !isOntimeDelivery && (
        <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1 animate-in fade-in duration-150">
          <div className="font-bold flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Zero Cash Collected Today</span>
          </div>
          <p className="text-[11px] text-purple-800">
            Full order balance of <strong>Rs. {balanceDue.toLocaleString()}</strong> will be added as debit to customer Khata ledger.
          </p>
        </div>
      )}

      {/* Settlement Notes (Optional) */}
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
          Settlement Notes / Remarks (Optional):
        </label>
        <input
          type="text"
          placeholder="e.g. Paid in full on delivery, delivered at door..."
          value={settlementNotes}
          onChange={(e) => setSettlementNotes(e.target.value)}
          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
        />
      </div>
    </div>
  );
}
