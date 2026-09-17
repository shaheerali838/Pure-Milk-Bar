import React from 'react';
import {
  Wallet,
  Coins,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
} from 'lucide-react';

/**
 * SupplierIntakePaymentSection
 * Inside the Milk Intake Form, provides live financial settlement tracking:
 * - Displays selected supplier name and previous unpaid balance
 * - Displays delivery shift (Morning/Evening), liters delivered, and total procurement cost
 * - Quick payment settlement buttons: Full (100%), Half (50%), Unpaid (0%)
 * - Interactive numeric input for custom amount paid now
 * - Live balance projection showing how supplier's pending balance will increase/decrease
 */
export default function SupplierIntakePaymentSection({
  supplierName = '',
  supplierId = '',
  supplierArea = '',
  priorBalanceDue = 0,
  shift = 'Morning',
  quantity = 0,
  ratePerLiter = 0,
  totalCost = 0,
  paidAmount = 0,
  settlement = 'Pending',
  onPaidAmountChange,
  onQuickSelect,
}) {
  const qty = parseFloat(quantity) || 0;
  const rate = parseFloat(ratePerLiter) || 0;
  const cost = parseFloat(totalCost) || 0;
  const paid = Math.min(cost, Math.max(0, parseFloat(paidAmount) || 0));
  const pendingForThisDelivery = Math.max(0, cost - paid);
  const priorDue = Math.max(0, parseFloat(priorBalanceDue) || 0);
  const projectedTotalBalance = priorDue + pendingForThisDelivery;

  const isMorning = shift?.toLowerCase() === 'morning';
  const isFullPaid = cost > 0 && pendingForThisDelivery <= 0;
  const isPartial = paid > 0 && pendingForThisDelivery > 0;
  const isUnpaid = cost > 0 && paid === 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header with Section Title & Supplier Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Payment &amp; Settlement Breakdown</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Shift delivery ledger and owner payout clearance
            </p>
          </div>
        </div>

        {/* Selected Supplier Badge */}
        {supplierName ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-800">{supplierName}</span>
            {supplierId && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                {supplierId}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Select a supplier first
          </span>
        )}
      </div>

      {/* 2. Top Metric Cards: Shift Details & Supplier Prior Pending Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card A: Current Shift Delivery Details */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              {isMorning ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span>{shift} Shift Intake</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {qty > 0 ? `${qty.toFixed(1)} L` : '0 L'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-slate-500 block">Rate / Liter</span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                Rs. {rate.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Delivery Value</span>
              <span className="text-base font-black text-slate-900 font-display tabular">
                Rs. {cost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Card B: Supplier Previous Unpaid / Pending Balance */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>Prior Unpaid Balance</span>
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
              Supplier Ledger
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-amber-800/80 block">Already Due</span>
              <span className="text-[11px] text-amber-700">Before this delivery</span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-amber-950 font-display tabular">
                Rs. {priorDue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Payment Buttons (Full / Half / Unpaid) */}
      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
          Owner Payment Settlement for this Delivery
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Full Payment Button (100%) */}
          <button
            type="button"
            onClick={() => onQuickSelect && onQuickSelect('Full')}
            disabled={cost <= 0}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              isFullPaid
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/40'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pay Full (100%)</span>
            </div>
            <span className={`text-[10px] font-mono ${isFullPaid ? 'text-emerald-100' : 'text-slate-500'}`}>
              Rs. {cost.toLocaleString()}
            </span>
          </button>

          {/* Half Payment Button (50%) */}
          <button
            type="button"
            onClick={() => onQuickSelect && onQuickSelect('Half')}
            disabled={cost <= 0}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              isPartial && paid === Math.round(cost / 2)
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/40'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800'
            }`}
          >
            <div className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>Pay Half (50%)</span>
            </div>
            <span className={`text-[10px] font-mono ${isPartial && paid === Math.round(cost / 2) ? 'text-blue-100' : 'text-slate-500'}`}>
              Rs. {Math.round(cost / 2).toLocaleString()}
            </span>
          </button>

          {/* Unpaid / Pending Button (0%) */}
          <button
            type="button"
            onClick={() => onQuickSelect && onQuickSelect('Unpaid')}
            disabled={cost <= 0}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              isUnpaid
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/40'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800'
            }`}
          >
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Unpaid (0%)</span>
            </div>
            <span className={`text-[10px] font-mono ${isUnpaid ? 'text-amber-100' : 'text-slate-500'}`}>
              Rs. 0 (Full Due)
            </span>
          </button>
        </div>
      </div>

      {/* 4. Custom Paid Amount Input Field & Settlement Status Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-8">
          <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
            Amount Paid by Owner Now (Rs.) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              PKR
            </span>
            <input
              type="number"
              min="0"
              max={cost > 0 ? cost : undefined}
              step="1"
              value={paidAmount}
              onChange={(e) => onPaidAmountChange && onPaidAmountChange(e.target.value)}
              placeholder="Enter amount paid to supplier..."
              className="w-full h-[44px] pl-13 pr-3.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 outline-none focus:border-emerald-600 shadow-2xs tabular"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Enter 0 for complete credit / unpaid, or any custom partial settlement.
          </span>
        </div>

        <div className="sm:col-span-4">
          <label className="block font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1.5">
            Settlement Status
          </label>
          <div className="h-[44px] px-3 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-xs text-slate-600 font-medium">Status:</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isFullPaid
                  ? 'bg-emerald-100 text-emerald-800'
                  : isPartial
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isFullPaid ? 'Paid in Full' : isPartial ? 'Partially Paid' : 'Pending Clearance'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Live Pending Increase / Decrease Ledger Projection */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/90 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Delivery Settlement Calculation</span>
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            {shift} Session
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Total Delivery Payable:</span>
            <strong className="text-slate-900 font-mono">Rs. {cost.toLocaleString()}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Paid by Owner:</span>
            <strong className="text-emerald-700 font-mono">- Rs. {paid.toLocaleString()}</strong>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
            <span className="flex items-center gap-1">
              <span>Remaining Pending (This Delivery):</span>
            </span>
            <span
              className={`font-mono text-sm ${
                pendingForThisDelivery > 0 ? 'text-amber-700' : 'text-emerald-600'
              }`}
            >
              Rs. {pendingForThisDelivery.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Projected Impact on Supplier's Overall Outstanding Balance */}
        <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="text-[11px] text-slate-600">
            <span>Projected Supplier Total Pending Balance:</span>
            <span className="text-[10px] text-slate-400 block">
              (Prior Rs. {priorDue.toLocaleString()} + Pending Rs. {pendingForThisDelivery.toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black text-slate-900 font-display tabular">
              Rs. {projectedTotalBalance.toLocaleString()}
            </span>
            {pendingForThisDelivery > 0 ? (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +{pendingForThisDelivery.toLocaleString()}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Cleared
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
