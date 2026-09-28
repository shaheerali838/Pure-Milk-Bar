import React from 'react';
import { Gauge, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function PhysicalMilkCheckCard({
  physicalMilk = '',
  onPhysicalMilkChange,
  expectedMilk = 0,
  varianceReason = '',
  onVarianceReasonChange,
  isClosed = false,
  savedClosing = null,
}) {
  const hasPhysical = physicalMilk !== '' && !isNaN(Number(physicalMilk));
  const measured = hasPhysical ? Number(physicalMilk) : (savedClosing?.physicalMilk ?? null);
  const variance = hasPhysical
    ? Number((Number(physicalMilk) - Number(expectedMilk)).toFixed(2))
    : (savedClosing?.milkVariance ?? null);

  const isSignificantVariance =
    variance !== null &&
    (Math.abs(variance) > 2 || (expectedMilk > 0 && Math.abs(variance) / expectedMilk > 0.02));

  const formatL = (val) => `${Number(val || 0).toLocaleString('en-PK', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} L`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Physical Milk Dipstick Measurement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Measure actual raw milk level remaining in chiller tanks before locking day closing.
            </p>
          </div>
        </div>

        {/* Expected Milk Badge */}
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
            System Expected
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
            {formatL(expectedMilk)}
          </span>
        </div>
      </div>

      {/* Input / Measurement Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Actual Measured Milk in Tanks (Liters)
          </label>
          {isClosed ? (
            <div className="h-10 px-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold flex items-center">
              {measured !== null ? formatL(measured) : 'Not recorded'}
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter tank dip reading (e.g. 150.5)"
                value={physicalMilk}
                onChange={(e) => onPhysicalMilkChange(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold pointer-events-none">
                Liters
              </span>
            </div>
          )}
        </div>

        {/* Live Variance Calculation Display */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Reconciliation Variance (Physical − Expected)
          </label>
          <div
            className={`h-10 px-3.5 rounded-xl border flex items-center justify-between font-bold text-sm ${
              variance === null
                ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                : Math.abs(variance) <= 0.5
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {variance === null ? (
                <span>Awaiting measurement input</span>
              ) : Math.abs(variance) <= 0.5 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Perfect Match ({variance > 0 ? `+${variance}` : variance} L)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Variance Detected ({variance > 0 ? `+${variance}` : variance} L)</span>
                </>
              )}
            </div>
            {variance !== null && (
              <span className="text-xs font-mono">
                {variance > 0 ? `+${variance}` : variance} L
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Variance Reason Input (Conditional when significant variance occurs) */}
      {isSignificantVariance && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1.5 animate-fadeIn">
          <label className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            Variance Explanation Required (Reason for {variance > 0 ? `+${variance}` : variance} L discrepancy)
          </label>
          {isClosed ? (
            <p className="text-xs text-amber-800 dark:text-amber-300 bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-200/50">
              {savedClosing?.varianceReason || 'No explanation recorded'}
            </p>
          ) : (
            <textarea
              rows={2}
              placeholder="e.g. Chiller dip calibration diff, unrecorded line-wash loss, evaporation..."
              value={varianceReason}
              onChange={(e) => onVarianceReasonChange(e.target.value)}
              className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          )}
        </div>
      )}
    </div>
  );
}
