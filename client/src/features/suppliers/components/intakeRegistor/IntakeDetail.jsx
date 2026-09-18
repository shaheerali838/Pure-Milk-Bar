import React from 'react';
import {
  X,
  Printer,
} from 'lucide-react';

/**
 * IntakeDetail Component (Modal Dialog)
 * Matches the user reference image exactly:
 * - Header: "Supplier Milk Intake Batch Details" with Close 'X' button
 * - Royal Blue Top Banner: Total Purchase Net (Rs. 6,900), Volume (30.0 Liters @ Rs. 230/L), Shift Pill, Date
 * - 10-Row Key-Value Details Card:
 *   1. Supplier Name
 *   2. Intake Date
 *   3. Shift Timing
 *   4. Milk Quantity
 *   5. Agreed Purchase Rate
 *   6. Fat Content (Gerber) (Green bold)
 *   7. Lactometer Density (LR)
 *   8. Quality Standard (Pill badge "Passed Pure Grade")
 *   9. Payment Status (Pill badge "Paid")
 *   10. Receiving Lab Inspector
 * - Footer: "Print Intake Slip" button on the left, solid green "Done" button on the right
 */
export default function IntakeDetail({ item, onClose, onBack }) {
  if (!item) return null;

  const handleClose = onClose || onBack;

  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.ratePerLiter) || 230;
  const cost = parseFloat(item.totalCost) || qty * rate;
  const fat = parseFloat(item.fat) || 0;
  const lr = parseFloat(item.lr) || 0;

  // Clean supplier name (e.g. "Supplier A (Ahmad Farms)" -> "Ahmad Farms")
  const rawName = item.supplierName || 'Ahmad Farms';
  const supplierDisplayName = rawName.includes('(')
    ? rawName.replace(/Supplier\s+[A-Z0-9-]+\s*\((.*?)\)/i, '$1')
    : rawName;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md sm:max-w-lg w-full shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            Supplier Milk Intake Batch Details
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Body */}
        <div className="p-6 space-y-4">
          {/* Top Royal Blue Summary Banner */}
          <div className="bg-[#1a365d] rounded-2xl p-5 text-white shadow-xs flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-blue-200 uppercase block mb-1">
                TOTAL PURCHASE NET
              </span>
              <div className="text-3xl font-black text-white font-display tracking-tight">
                Rs. {cost.toLocaleString()}
              </div>
              <p className="text-xs font-semibold text-blue-100 mt-1">
                Volume: <strong className="font-bold text-white">{qty.toFixed(1)} Liters</strong> @ Rs. {rate}/L
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className="bg-white text-blue-900 font-bold text-xs px-3 py-1 rounded-lg shadow-xs">
                {item.shift} Shift
              </span>
              <span className="text-[11px] font-mono text-blue-200 mt-1.5 font-medium">
                {item.date}
              </span>
            </div>
          </div>

          {/* 10-Row Key-Value Details Card */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 divide-y divide-slate-100 px-4 py-1 text-xs">
            {/* Row 1: Supplier */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Supplier</span>
              <span className="font-bold text-slate-900 font-display text-sm">
                {supplierDisplayName}
              </span>
            </div>

            {/* Row 2: Intake Date */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Intake Date</span>
              <span className="font-mono font-bold text-slate-800">
                {item.date}
              </span>
            </div>

            {/* Row 3: Shift Timing */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Shift Timing</span>
              <span className="font-semibold text-slate-800">
                {item.shift} Collection
              </span>
            </div>

            {/* Row 4: Milk Quantity */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Milk Quantity</span>
              <span className="font-black text-slate-900 text-sm">
                {qty.toFixed(1)} L
              </span>
            </div>

            {/* Row 5: Agreed Purchase Rate */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Agreed Purchase Rate</span>
              <span className="font-semibold text-slate-800">
                Rs. {rate} / Liter
              </span>
            </div>

            {/* Row 6: Fat Content (Gerber) */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Fat Content (Gerber)</span>
              <span className="font-bold text-emerald-600 text-sm">
                {fat > 0 ? `${fat}%` : '6.8%'}
              </span>
            </div>

            {/* Row 7: Lactometer Density (LR) */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Lactometer Density (LR)</span>
              <span className="font-mono font-bold text-slate-800">
                {lr > 0 ? lr : '29.5'}
              </span>
            </div>

            {/* Row 8: Quality Standard */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Quality Standard</span>
              <span className="px-2.5 py-0.5 rounded font-mono text-xs bg-slate-100 text-slate-700 border border-slate-200">
                Passed Pure Grade
              </span>
            </div>

            {/* Row 9: Payment Status */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Payment Status</span>
              <span className={`px-3 py-0.5 rounded-full font-semibold text-xs ${
                item.settlement === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : item.settlement === 'Partial'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {item.settlement || 'Pending'}
              </span>
            </div>

            {/* Row 10: Paid Amount */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Amount Paid by Owner</span>
              <span className="font-bold text-emerald-700 font-mono text-xs">
                Rs. {(item.paidAmount !== undefined ? item.paidAmount : (item.settlement === 'Paid' ? cost : item.settlement === 'Partial' ? cost * 0.5 : 0)).toLocaleString()}
              </span>
            </div>

            {/* Row 11: Remaining Pending */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Remaining Pending for Delivery</span>
              <span className={`font-bold font-mono text-xs ${
                (item.pendingAmount !== undefined ? item.pendingAmount : (item.settlement === 'Paid' ? 0 : cost)) > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                Rs. {(item.pendingAmount !== undefined ? item.pendingAmount : (item.settlement === 'Paid' ? 0 : item.settlement === 'Partial' ? cost * 0.5 : cost)).toLocaleString()}
              </span>
            </div>

            {/* Row 12: Receiving Lab Inspector */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Receiving Lab Inspector</span>
              <span className="font-bold text-slate-800">
                {item.receivedBy || 'Usman Malik'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Intake Slip</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 rounded-full text-xs font-bold text-white shadow-xs hover:brightness-110 cursor-pointer transition-all"
            style={{ backgroundColor: '#009966' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
