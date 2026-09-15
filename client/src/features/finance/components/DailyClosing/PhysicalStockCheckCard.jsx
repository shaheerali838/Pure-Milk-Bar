import React from 'react';
import { ClipboardCheck, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/common/Typography';

export default function PhysicalStockCheckCard({
  physicalStock = '',
  onPhysicalStockChange,
  expectedStock = null,
  variance = null,
}) {
  const isInputGiven = physicalStock !== '' && !isNaN(Number(physicalStock));
  const numericPhysical = isInputGiven ? Number(physicalStock) : null;
  const numVariance = variance !== null ? Number(variance) : null;

  return (
    <Card className="border border-slate-200/90 shadow-sm bg-white rounded-2xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <Typography variant="h4" className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                How much milk is actually left?
              </Typography>
              <Typography variant="caption" color="muted">
                Dip-rod / tank sensor measurement taken at day end.
              </Typography>
            </div>
          </div>

          <Badge
            variant={
              numVariance === 0
                ? 'green'
                : numVariance !== null && numVariance < 0
                ? 'destructive'
                : numVariance !== null && numVariance > 0
                ? 'amber'
                : 'slate'
            }
            className="text-[10px] font-bold px-2 py-0.5"
          >
            {numVariance === 0
              ? 'Perfect Match'
              : numVariance !== null && numVariance < 0
              ? 'Shortage'
              : numVariance !== null && numVariance > 0
              ? 'Surplus'
              : 'Awaiting Count'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 space-y-4 text-xs">
        {/* Input Field: Physical Measured Liters */}
        <div className="space-y-1.5">
          <Label htmlFor="physicalClosingStock" className="text-xs font-bold text-slate-700">
            Actual Measured Stock in Tanks (Liters)
          </Label>
          <div className="relative">
            <Input
              id="physicalClosingStock"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 140"
              value={physicalStock}
              onChange={(e) => onPhysicalStockChange(e.target.value)}
              className="pr-12 text-sm font-bold text-slate-900 bg-slate-50/50 border-slate-200 focus:bg-white tabular"
            />
            <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
              Liters
            </span>
          </div>
          <Typography variant="caption" color="muted" className="text-[11px] block">
            Measure all cold tanks, pasteurizer, and counter storage combined.
          </Typography>
        </div>

        {/* Difference from Expected Result Box */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            numVariance === 0
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : numVariance !== null && numVariance < 0
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : numVariance !== null && numVariance > 0
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {numVariance === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : numVariance !== null ? (
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${
                    numVariance < 0 ? 'text-rose-600' : 'text-amber-600'
                  }`}
                />
              ) : (
                <Scale className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <div>
                <Typography
                  variant="bodySmall"
                  className="font-bold text-xs"
                >
                  Difference from expected
                </Typography>
                <Typography variant="caption" color="muted" className="text-[10px] block">
                  {numVariance === 0
                    ? 'Tank milk matches sales & production calculations exactly.'
                    : numVariance !== null && numVariance < 0
                    ? 'Tanks have less milk than calculated by system.'
                    : numVariance !== null && numVariance > 0
                    ? 'Tanks have more milk than calculated by system.'
                    : 'Formula: Actual Measured Stock &minus; Expected Closing Stock'}
                </Typography>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`text-sm sm:text-base font-black tabular font-display ${
                  numVariance === 0
                    ? 'text-emerald-700'
                    : numVariance !== null && numVariance < 0
                    ? 'text-rose-600'
                    : numVariance !== null && numVariance > 0
                    ? 'text-amber-700'
                    : 'text-slate-400'
                }`}
              >
                {numVariance === null
                  ? '—'
                  : numVariance > 0
                  ? `+${numVariance.toLocaleString()} L`
                  : `${numVariance.toLocaleString()} L`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
