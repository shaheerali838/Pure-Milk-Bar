import React, { useState } from 'react';
import { Layers, Droplets, ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, History, Sparkles } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useDahiContext } from '@/context/DahiContext';

const normalizeDate = (d) => {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d).slice(0, 10);
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
};

export default function DahiAuditCard({ onFilterDahiEvents }) {
  const [isOpen, setIsOpen] = useState(false);
  const { batches = [] } = useDahiContext() || {};

  const todayStr = normalizeDate(new Date());

  const todayBatches = (batches || []).filter((b) => {
    const bDate = normalizeDate(b.date || b.batchDate || b.createdAt);
    return bDate === todayStr;
  });

  const totalDahiProduced = todayBatches.reduce(
    (sum, b) => sum + (Number(b.outputVal || b.outputQuantity || b.output) || 0),
    0
  );
  const totalMilkUsed = todayBatches.reduce(
    (sum, b) => sum + (Number(b.milkUsedVal || b.milkUsedQuantity || b.milkUsed) || 0),
    0
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-teal-200/90 dark:border-teal-900/60 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      <div className="p-4 bg-linear-to-r from-teal-50/80 via-white to-slate-50 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white font-display">
                Dahi &amp; Value-Add Processing Audit Log
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                {todayBatches.length} Batches Logged Today
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Production yield audits, milk deduction records, and flavor batch transitions for {todayStr}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onFilterDahiEvents && (
            <button
              type="button"
              onClick={onFilterDahiEvents}
              className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition cursor-pointer"
            >
              Filter Dahi Events in Log
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <span>{isOpen ? 'Hide Audit Table' : 'Inspect Batches'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mini KPIs Ribbon */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800 bg-teal-50/20 dark:bg-slate-900/30 text-xs">
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Batches</span>
          <span className="font-display font-black text-slate-900 dark:text-white text-base tabular">
            {todayBatches.length}
          </span>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Milk Converted</span>
          <span className="font-display font-black text-slate-900 dark:text-white text-base tabular">
            {totalMilkUsed.toFixed(1)} L
          </span>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block">Dahi Added to Stock</span>
          <span className="font-display font-black text-teal-700 dark:text-teal-400 text-base tabular">
            {totalDahiProduced.toFixed(1)} kg
          </span>
        </div>
      </div>

      {/* Expanded Table */}
      {isOpen && (
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <TableRow>
                <TableHead className="py-2.5 px-3 font-bold uppercase text-[10px] text-slate-500">Batch ID</TableHead>
                <TableHead className="py-2.5 px-3 font-bold uppercase text-[10px] text-slate-500">Product</TableHead>
                <TableHead className="py-2.5 px-3 font-bold uppercase text-[10px] text-slate-500 text-right">Farm Milk</TableHead>
                <TableHead className="py-2.5 px-3 font-bold uppercase text-[10px] text-slate-500 text-right">Supplier Milk</TableHead>
                <TableHead className="py-2.5 px-3 font-bold uppercase text-[10px] text-slate-500 text-right">Total Milk (L)</TableHead>
                <TableHead className="py-2.5 px-3 font-bold uppercase text-[10px] text-slate-500 text-right">Output (kg)</TableHead>
                <TableHead className="py-2.5 px-3 font-bold uppercase text-[10px] text-slate-500 text-center">Audit Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
              {todayBatches.length > 0 ? (
                todayBatches.map((batch, idx) => (
                  <TableRow key={batch.id || idx} className="hover:bg-teal-50/30">
                    <TableCell className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {batch.batchNumber || batch.id}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {batch.product || batch.variant || 'Dahi (Plain)'}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right font-medium text-amber-700 tabular">
                      {Number(batch.farmMilkUsed || 0).toFixed(1)} L
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right font-medium text-blue-700 tabular">
                      {Number(batch.supplierMilkUsed || 0).toFixed(1)} L
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right font-bold text-slate-900 tabular">
                      {Number(batch.milkUsedVal || batch.milkUsedQuantity || batch.milkUsed || 0).toFixed(1)} L
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right font-black text-teal-700 tabular">
                      {Number(batch.outputVal || batch.outputQuantity || batch.output || 0).toFixed(1)} kg
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {batch.status || 'Verified'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-slate-500 text-xs">
                    No Dahi processing batches recorded for today ({todayStr}).
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
