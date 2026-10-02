import React, { useState } from 'react';
import { Layers, Droplets, TrendingUp, CheckCircle2, Clock, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useDahiContext } from '@/context/DahiContext';

const normalizeDate = (d) => {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d).slice(0, 10);
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
};

export default function DailyDahiStatusCard({
  selectedDate = '',
  breakdown = null,
  isClosed = false,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { batches = [] } = useDahiContext() || {};

  // Find batches from DahiContext or from closing breakdown
  const targetDate = selectedDate || normalizeDate(new Date());

  const dayBatches = (batches || []).filter((b) => {
    const bDate = normalizeDate(b.date || b.batchDate || b.createdAt);
    return bDate === targetDate;
  });

  const activeBatches = dayBatches.length > 0
    ? dayBatches
    : (breakdown?.processing?.logs || []);

  // Calculate day metrics
  const totalBatches = activeBatches.length;
  const totalDahiProduced = activeBatches.reduce(
    (sum, b) => sum + (Number(b.outputVal || b.outputQuantity || b.output) || 0),
    0
  );
  const totalMilkUsed = activeBatches.reduce(
    (sum, b) => sum + (Number(b.milkUsedVal || b.milkUsedQuantity || b.milkUsedLiters || b.milkUsed) || 0),
    0
  );
  const farmMilkUsed = activeBatches.reduce(
    (sum, b) => sum + (Number(b.farmMilkUsed) || 0),
    0
  );
  const supplierMilkUsed = activeBatches.reduce(
    (sum, b) => sum + (Number(b.supplierMilkUsed) || Math.max(0, Number(b.milkUsedVal || b.milkUsedQuantity || b.milkUsedLiters || b.milkUsed || 0) - Number(b.farmMilkUsed || 0))),
    0
  );

  const avgYield = totalMilkUsed > 0 ? ((totalDahiProduced / totalMilkUsed) * 100).toFixed(1) : '100.0';

  return (
    <div className="bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-900/50 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-teal-50/90 via-white to-slate-50 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900 border-b border-teal-100 dark:border-teal-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
                Dahi &amp; Dairy Processing Daily Status
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                {totalBatches} {totalBatches === 1 ? 'Batch' : 'Batches'} Today
              </span>
              {isClosed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  Reconciled in Closing
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live status of milk converted into Dahi, yield ratios, flavor variants, and production batches for {targetDate}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Details' : 'View Full Batches'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4 Summary Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 bg-teal-50/20 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
        <div className="p-3.5 sm:p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Total Dahi Produced
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400 font-display tabular">
              {totalDahiProduced.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Across {totalBatches} production batches
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Total Milk Consumed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tabular">
              {totalMilkUsed.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Deducted from raw milk stock
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Farm vs Supplier Milk
          </span>
          <div className="flex items-baseline gap-2 text-sm font-black tabular">
            <span className="text-amber-700 dark:text-amber-400">
              {farmMilkUsed.toFixed(0)}L <span className="text-[10px] font-normal text-slate-500">Farm</span>
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-700 dark:text-blue-400">
              {supplierMilkUsed.toFixed(0)}L <span className="text-[10px] font-normal text-slate-500">Supplier</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Milk source origin breakdown
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Conversion Efficiency
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display tabular">
              {avgYield}%
            </span>
            <span className="text-xs font-bold text-emerald-500">Yield</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Output kg vs input liters
          </span>
        </div>
      </div>

      {/* Collapsible Detailed Batch Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs sm:text-sm">
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <TableRow>
                <TableHead className="py-2.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Batch #
                </TableHead>
                <TableHead className="py-2.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Product / Flavor Variant
                </TableHead>
                <TableHead className="py-2.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Farm Milk (L)
                </TableHead>
                <TableHead className="py-2.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Supplier Milk (L)
                </TableHead>
                <TableHead className="py-2.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Total Milk Used
                </TableHead>
                <TableHead className="py-2.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Dahi Output
                </TableHead>
                <TableHead className="py-2.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                  Production Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeBatches.length > 0 ? (
                activeBatches.map((batch, idx) => (
                  <TableRow
                    key={batch.id || batch._id || idx}
                    className="hover:bg-teal-50/30 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="py-3 px-4 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {batch.batchNumber || batch.id || batch._id}
                    </TableCell>

                    <TableCell className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {batch.product || batch.variant || 'Dahi (Plain)'}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 px-4 text-right tabular font-medium text-amber-700 dark:text-amber-400">
                      {Number(batch.farmMilkUsed || 0).toFixed(1)} L
                    </TableCell>

                    <TableCell className="py-3 px-4 text-right tabular font-medium text-blue-700 dark:text-blue-400">
                      {Number(batch.supplierMilkUsed || 0).toFixed(1)} L
                    </TableCell>

                    <TableCell className="py-3 px-4 text-right tabular font-bold text-slate-900 dark:text-white">
                      {Number(batch.milkUsedVal || batch.milkUsedQuantity || batch.milkUsedLiters || batch.milkUsed || 0).toFixed(1)} L
                    </TableCell>

                    <TableCell className="py-3 px-4 text-right tabular font-black text-teal-700 dark:text-teal-400">
                      {Number(batch.outputVal || batch.outputQuantity || batch.output || 0).toFixed(1)} kg
                    </TableCell>

                    <TableCell className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {batch.status || 'Completed'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs"
                  >
                    No Dahi processing batches logged for {targetDate}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
