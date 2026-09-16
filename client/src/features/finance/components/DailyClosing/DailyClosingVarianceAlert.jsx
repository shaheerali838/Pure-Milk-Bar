import React from 'react';
import { AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/common/Typography';

export default function DailyClosingVarianceAlert({
  variance = 0,
  hasPhysicalCount = false,
  status = 'open',
}) {
  const hasVariance = hasPhysicalCount && variance !== 0 && variance !== null;
  const isPendingInput = !hasPhysicalCount;

  return (
    <Alert
      variant="warning"
      className="bg-amber-50/90 border-amber-200/90 text-amber-950 p-4 rounded-xl shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100/90 rounded-lg text-amber-700 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <AlertTitle className="text-sm font-bold text-amber-900 mb-0">
                {hasVariance
                  ? 'Verification Required: Difference from Expected Detected'
                  : isPendingInput
                  ? 'Pending Evening Stock Count Before Day End'
                  : 'Daily Mass Balance Ready for Verification'}
              </AlertTitle>
              {hasVariance && (
                <Badge variant="amber" className="text-[10px] font-bold bg-amber-200/80 text-amber-900 border-amber-300">
                  {variance > 0 ? `+${variance} L Surplus` : `${variance} L Shortage`}
                </Badge>
              )}
            </div>
            <AlertDescription className="text-xs text-amber-800/90">
              {hasVariance
                ? 'The actual measured milk in tanks differs from the calculated expected stock. Please check spillage or delivery logs before confirming the daily closing.'
                : isPendingInput
                ? 'Enter the actual milk left in your tanks in the box below to calculate any difference from expected sales and production.'
                : 'All milk flow mass-balance records and cash drawer entries are aligned. You can proceed with confirming the day end.'}
            </AlertDescription>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-800 shadow-2xs">
            {status === 'closed' ? 'Day Locked' : 'Action Required'}
          </span>
        </div>
      </div>
    </Alert>
  );
}
