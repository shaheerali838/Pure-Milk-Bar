import React from 'react';
import { Lock, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/common/Typography';

export default function ConfirmClosingDialog({
  open = false,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  summaryData = {},
  physicalStock = '',
  variance = null,
}) {
  const { milkFlow = {}, collections = {}, financialSummary = {} } = summaryData;

  const numVariance = variance !== null ? Number(variance) : null;
  const netCash = financialSummary?.netCashLiquidFlow;

  const formatLiters = (val) => {
    if (val === null || val === undefined) return '—';
    return `${Number(val).toLocaleString()} L`;
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '—';
    return `Rs. ${Number(val).toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl border border-slate-200">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100">
              <Lock className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
              Confirm Day End Closing
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Lock today's milk flow mass balance and cash drawer totals. Once confirmed, today's registers will be finalized.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 my-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <Typography variant="overline" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              CLOSING AUDIT SUMMARY
            </Typography>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Expected Closing Stock:</span>
              <span className="font-bold text-slate-800 tabular">
                {formatLiters(milkFlow.expectedClosingStock)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Physical Measured Stock:</span>
              <span className="font-bold text-slate-800 tabular">
                {physicalStock !== '' ? `${physicalStock} L` : '— (Not entered)'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-600">Stock Difference:</span>
              <span
                className={`font-black tabular ${
                  numVariance === 0
                    ? 'text-emerald-700'
                    : numVariance !== null && numVariance < 0
                    ? 'text-rose-600'
                    : numVariance !== null && numVariance > 0
                    ? 'text-amber-700'
                    : 'text-slate-500'
                }`}
              >
                {numVariance === null
                  ? '—'
                  : numVariance > 0
                  ? `+${numVariance} L`
                  : `${numVariance} L`}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-600">Net Liquid Cash Flow:</span>
              <span className="font-black text-emerald-700 tabular font-display">
                {formatCurrency(netCash)}
              </span>
            </div>
          </div>

          {numVariance !== null && numVariance !== 0 && (
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-tight">
                <strong>Notice:</strong> There is a {numVariance > 0 ? `+${numVariance} L surplus` : `${numVariance} L shortage`} between physical stock and calculated expected stock. This will be recorded in the audit log.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="cursor-pointer font-semibold text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="cursor-pointer font-bold text-xs bg-[#00a86b] hover:bg-[#008f5b] text-white shadow-xs"
          >
            {isSubmitting ? 'Finalizing...' : 'Confirm & Lock Day End'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
