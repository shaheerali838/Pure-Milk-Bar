import React, { useState } from 'react';
import { Milk, ChevronDown, ChevronUp, PlusCircle, ArrowDown, ArrowUp, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MilkHisaabAccordion({
  milk = {},
  onOpenAddWastage,
  isClosed = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatL = (val) => `${Number(val || 0).toLocaleString('en-PK', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} L`;

  const openingStock = milk.openingStock || 0;
  const farmProduction = milk.farmProduction || 0;
  const supplierInflow = milk.supplierInflow || 0;
  const totalAvailable = milk.totalAvailable || (openingStock + farmProduction + supplierInflow);

  const counterSales = milk.counterSales || 0;
  const doorstepSales = milk.doorstepSales || 0;
  const processingUsed = milk.processingUsed || 0;
  const wastage = milk.wastage || 0;
  const totalOut = milk.totalOut || (counterSales + doorstepSales + processingUsed + wastage);

  const expectedClosing = milk.expectedClosing || (totalAvailable - totalOut);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Header with expand/collapse toggle */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1 select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Milk Reconciliation (Mass Balance)
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {formatL(expectedClosing)} Closing
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit balance: Total Inflows (Farm + Suppliers) minus Total Outflows (Counter, Deliveries, Processing, Wastage)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && onOpenAddWastage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAddWastage}
              className="text-xs h-8 border-rose-200 hover:bg-rose-50 text-rose-700 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40 gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-600" />
              Add Wastage
            </Button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Breakdown Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inflows Card */}
            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                Milk Inflows (Received)
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>1. Opening Stock (From Yesterday)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatL(openingStock)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>2. Farm Milking Production</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatL(farmProduction)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>3. Supplier Milk Intake</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatL(supplierInflow)}</span>
                </div>

                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex justify-between font-bold text-emerald-900 dark:text-emerald-200">
                  <span>Total Available Raw Milk</span>
                  <span>{formatL(totalAvailable)}</span>
                </div>
              </div>
            </div>

            {/* Outflows Card */}
            <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUp className="w-3.5 h-3.5 text-rose-600" />
                Milk Outflows (Sales & Usage)
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>4. POS Counter Walk-in Sales</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatL(counterSales)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>5. Doorstep Delivery Runs</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatL(doorstepSales)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>6. Processing & Value-Add Used</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatL(processingUsed)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>7. Spoilage & Wastage</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{formatL(wastage)}</span>
                </div>

                <div className="pt-2 border-t border-rose-200 dark:border-rose-800/60 flex justify-between font-bold text-rose-900 dark:text-rose-200">
                  <span>Total Milk Deductions</span>
                  <span>{formatL(totalOut)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Formula Banner */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-slate-300">
              Formula: <span className="text-emerald-400">{formatL(totalAvailable)} (Available)</span> &minus;{' '}
              <span className="text-rose-400">{formatL(totalOut)} (Outflows)</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Expected Closing:</span>
              <span className="font-black text-emerald-400 text-base">{formatL(expectedClosing)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
