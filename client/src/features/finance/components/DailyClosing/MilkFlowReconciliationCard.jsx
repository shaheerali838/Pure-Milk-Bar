import React from 'react';
import { Milk, ArrowDownRight, ArrowUpRight, HelpCircle, Package, Layers, Droplet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Typography } from '@/components/common/Typography';

export default function MilkFlowReconciliationCard({ milkFlow = {} }) {
  const {
    morningOpeningStock = null,
    farmProduction = null,
    supplierInflow = null, // Placeholder: Supplier Dashboard isn't built yet
    totalAvailable = null,
    counterPosSales = null,
    doorstepDeliveries = null,
    dahiProcessingUsed = null,
    spoiledWastage = null,
    totalDeductions = null,
    expectedClosingStock = null,
  } = milkFlow;

  const formatLiters = (val) => {
    if (val === null || val === undefined) return '—';
    return `${Number(val).toLocaleString()} L`;
  };

  return (
    <TooltipProvider>
      <Card className="border border-slate-200/90 shadow-sm bg-white rounded-2xl flex flex-col justify-between">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100">
                <Milk className="w-4 h-4" />
              </div>
              <div>
                <Typography variant="h4" className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                  Milk In &amp; Milk Out Today
                </Typography>
                <Typography variant="caption" color="muted">
                  All milk measured strictly in Liters (L) from morning to night.
                </Typography>
              </div>
            </div>

            <Badge variant="green" className="text-[10px] font-bold px-2 py-0.5">
              Mass Balance
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-2 space-y-4 text-xs">
          {/* Group 1: Morning Stock & Inflows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <Typography variant="overline" className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                1. OPENING STOCK &amp; INFLOW
              </Typography>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> Milk Received
              </span>
            </div>

            {/* Row 1: Morning Opening Tank Stock */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <div>
                  <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs">
                    Morning Opening Tank Stock
                  </Typography>
                  <Typography variant="caption" color="muted" className="text-[10px] block">
                    Milk already in cold chillers from previous day
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 tabular">
                  {formatLiters(morningOpeningStock)}
                </span>
              </div>
            </div>

            {/* Row 2: Farm Morning + Evening Production */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <div>
                  <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs">
                    Farm Milking (Morning + Evening)
                  </Typography>
                  <Typography variant="caption" color="muted" className="text-[10px] block">
                    Fresh milking received from dairy shed animals
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 tabular">
                  {farmProduction !== null ? `+${formatLiters(farmProduction)}` : '—'}
                </span>
              </div>
            </div>

            {/* Row 3: Supplier Milk Inflow (Placeholder - No Supplier Dashboard yet) */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs">
                      Supplier Milk Inflow
                    </Typography>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Supplier Dashboard module integration pending.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Typography variant="caption" color="muted" className="text-[10px] block">
                    Third-party dairy supplier purchase
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 tabular">
                  {supplierInflow !== null ? `+${formatLiters(supplierInflow)}` : '—'}
                </span>
              </div>
            </div>

            {/* Inflow Subtotal */}
            <div className="flex items-center justify-between px-2 pt-1 font-bold text-xs text-slate-700">
              <span className="text-[11px] font-bold text-slate-600">Total Milk Available Today</span>
              <span className="font-black text-slate-900 tabular">
                {formatLiters(totalAvailable)}
              </span>
            </div>
          </div>

          <Separator className="bg-slate-200/80" />

          {/* Group 2: Outflows & Deductions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <Typography variant="overline" className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                2. MILK DISPATCHED &amp; DEDUCTIONS
              </Typography>
              <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Milk Dispatched
              </span>
            </div>

            {/* Row 4: Walk-in Counter POS Sales */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  4
                </span>
                <div>
                  <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs">
                    Counter POS Sales
                  </Typography>
                  <Typography variant="caption" color="muted" className="text-[10px] block">
                    Fresh raw milk sold to walk-in shop customers
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-rose-600 tabular">
                  {counterPosSales !== null ? `-${formatLiters(counterPosSales)}` : '—'}
                </span>
              </div>
            </div>

            {/* Row 5: Doorstep Deliveries */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  5
                </span>
                <div>
                  <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs">
                    Doorstep Delivery Sales
                  </Typography>
                  <Typography variant="caption" color="muted" className="text-[10px] block">
                    Morning &amp; evening home delivery routes
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-rose-600 tabular">
                  {doorstepDeliveries !== null ? `-${formatLiters(doorstepDeliveries)}` : '—'}
                </span>
              </div>
            </div>

            {/* Row 6: Dahi & Product Processing Used */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  6
                </span>
                <div>
                  <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs">
                    Used for Dahi &amp; Value-Add
                  </Typography>
                  <Typography variant="caption" color="muted" className="text-[10px] block">
                    Milk transferred to boiling &amp; fermentation tanks
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-rose-600 tabular">
                  {dahiProcessingUsed !== null ? `-${formatLiters(dahiProcessingUsed)}` : '—'}
                </span>
              </div>
            </div>

            {/* Row 7: Spoilage / Wastage */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  7
                </span>
                <div>
                  <Typography variant="bodySmall" className="font-semibold text-slate-800 text-xs">
                    Spoiled / Spillage Wastage
                  </Typography>
                  <Typography variant="caption" color="muted" className="text-[10px] block">
                    Recorded milk loss, curding, or line washing
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-500 tabular">
                  {spoiledWastage !== null ? `-${formatLiters(spoiledWastage)}` : '—'}
                </span>
              </div>
            </div>

            {/* Outflow Subtotal */}
            <div className="flex items-center justify-between px-2 pt-1 font-bold text-xs text-slate-700">
              <span className="text-[11px] font-bold text-slate-600">Total Milk Outflow Today</span>
              <span className="font-black text-rose-600 tabular">
                {formatLiters(totalDeductions)}
              </span>
            </div>
          </div>

          <Separator className="bg-slate-200/80" />

          {/* Group 3: Expected Closing Stock */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
            <div>
              <Typography variant="bodySmall" className="font-bold text-emerald-950 text-xs">
                Expected Milk Left in Tanks
              </Typography>
              <Typography variant="caption" className="text-emerald-700/80 text-[10px] block">
                Formula: Available Milk (1+2+3) &minus; Outflow (4+5+6+7)
              </Typography>
            </div>
            <div className="text-right">
              <span className="text-sm sm:text-base font-black text-emerald-700 tabular font-display">
                {formatLiters(expectedClosingStock)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
