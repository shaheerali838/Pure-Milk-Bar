import React from 'react';
import { Lock, AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmClosingDialog({
  open = false,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  summaryData = {},
  physicalMilk = '',
  physicalCash = '',
  varianceReason = '',
  notes = '',
  onNotesChange,
}) {
  const expectedMilk = summaryData.milk?.expectedClosing ?? 0;
  const hasPhysicalMilk = physicalMilk !== '' && !isNaN(Number(physicalMilk));
  const milkVariance = hasPhysicalMilk
    ? Number((Number(physicalMilk) - Number(expectedMilk)).toFixed(2))
    : 0;

  const expectedCash = summaryData.cash?.expectedInDrawer ?? 0;
  const grossRevenue = summaryData.profit?.grossRevenue ?? 0;
  const estimatedProfit = summaryData.profit?.estimatedProfit ?? 0;

  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-PK')}`;
  const formatL = (val) => `${Number(val || 0).toLocaleString('en-PK', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} L`;

  const isHighVariance = Math.abs(milkVariance) > 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950">
              <Lock className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Confirm & Finalize Daily Closing
            </DialogTitle>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Locking this closing saves a permanent snapshot to the database. Tomorrow's opening stocks will automatically carry over from this record.
          </p>
        </DialogHeader>

        <div className="space-y-3.5 pt-2">
          {/* Summary Comparison Grid */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Closing Date:</span>
              <span className="font-bold text-slate-900 dark:text-white">{summaryData.date || 'Today'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Milk Expected vs Measured:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatL(expectedMilk)} → <span className="text-emerald-600">{formatL(hasPhysicalMilk ? Number(physicalMilk) : expectedMilk)}</span>
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Milk Variance:</span>
              <span
                className={`font-bold ${
                  Math.abs(milkVariance) <= 0.5
                    ? 'text-emerald-600'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {milkVariance > 0 ? `+${milkVariance}` : milkVariance} L
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Expected Cash in Drawer:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRs(expectedCash)}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Estimated Day Profit:</span>
              <span className={`font-black ${estimatedProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'}`}>
                {formatRs(estimatedProfit)}
              </span>
            </div>
          </div>

          {/* Variance Warning if High */}
          {isHighVariance && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Milk variance is {milkVariance > 0 ? `+${milkVariance}` : milkVariance} L</span>
                <span>Explanation will be recorded with this snapshot.</span>
              </div>
            </div>
          )}

          {/* Supervisor Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Supervisor Closing Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Clean closing, chiller defrost completed, night guard handed over."
              value={notes}
              onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
              className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Confirming Closing...
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Confirm & Lock Day
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
