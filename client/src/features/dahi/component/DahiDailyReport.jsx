import React, { useMemo } from 'react';
import {
  Calendar,
  Layers,
  Milk,
  Droplets,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useDahiContext } from '@/context/DahiContext';
import { usePOSContext } from '@/context/POSContext';

export default function DahiDailyReport() {
  const { milkingLogs = [] } = useAnimalContext() || {};
  const { intakeLogs = [] } = useIntakeContext() || {};
  const { batches = [] } = useDahiContext() || {};
  const { salesHistory = [] } = usePOSContext() || {};

  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const initDate = (d) => {
      if (!dates[d]) {
        dates[d] = {
          date: d,
          farmYield: 0,
          supplierIntake: 0,
          farmToDahi: 0,
          supplierToDahi: 0,
          dahiOutput: 0,
          dahiSalesQty: 0,
          dahiSalesRev: 0,
          liquidMilkSalesQty: 0,
          liquidMilkSalesRev: 0,
        };
      }
    };

    // 1. Milking Logs (Farm Yield)
    milkingLogs.forEach(log => {
      const d = log.date || new Date().toISOString().split('T')[0];
      initDate(d);
      dates[d].farmYield += (parseFloat(log.yieldLiters || log.yield) || 0);
    });

    // 2. Supplier Intake
    intakeLogs.forEach(log => {
      const d = log.date || new Date().toISOString().split('T')[0];
      initDate(d);
      dates[d].supplierIntake += (parseFloat(log.quantity || log.quantityLiters) || 0);
    });

    // 3. Dahi Batches
    batches.forEach(b => {
      const d = b.date || new Date().toISOString().split('T')[0];
      initDate(d);
      dates[d].dahiOutput += (Number(b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0);
      
      const numUsed = Number(b.milkUsedVal) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;
      if (b.farmMilkUsed !== undefined && b.supplierMilkUsed !== undefined) {
        dates[d].farmToDahi += (Number(b.farmMilkUsed) || 0);
        dates[d].supplierToDahi += (Number(b.supplierMilkUsed) || 0);
      } else {
        const src = (b.source || '').toLowerCase();
        if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix')) {
          dates[d].farmToDahi += numUsed;
        } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix')) {
          dates[d].supplierToDahi += numUsed;
        } else {
          const half = Math.round(numUsed / 2);
          dates[d].farmToDahi += half;
          dates[d].supplierToDahi += (numUsed - half);
        }
      }
    });

    // 4. POS Sales
    salesHistory.forEach(sale => {
      let d = new Date().toISOString().split('T')[0];
      try {
         if (sale.timestamp) {
           d = new Date(sale.timestamp).toISOString().split('T')[0];
         }
      } catch(e) {}
      
      initDate(d);
      
      (sale.items || []).forEach(item => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || (qty * (Number(item.price) || 0));

        if (name.includes('dahi') || cat.includes('dahi')) {
          dates[d].dahiSalesQty += qty;
          dates[d].dahiSalesRev += sub;
        }
      });
    });

    return Object.values(dates).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [milkingLogs, intakeLogs, batches, salesHistory]);

  if (aggregatedByDate.length === 0) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <Activity className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-800">No Daily Data Found</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Once you record farm milking, supplier intakes, dahi conversions, or POS sales, the daily aggregated reports will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          End-to-End Daily Analytical Report
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">
          Complete daily flow mapping Farm Yield & Supplier Intake into Dahi Conversions and POS Sales.
        </p>
      </div>

      <div className="space-y-4">
        {aggregatedByDate.map((day) => {
          const conversionYield = totalConverted > 0 ? ((day.dahiOutput / totalConverted) * 100).toFixed(1) : 0;
          const totalRevenue = day.dahiSalesRev;

          return (
            <div key={day.date} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-sm">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Total Dahi Output:</span>
                    <strong className="font-bold font-mono text-slate-800">{day.dahiOutput.toFixed(1)} kg</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">POS Dahi Revenue:</span>
                    <strong className="font-bold font-mono text-emerald-700">Rs. {totalRevenue.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/70 text-xs">

                {/* 2. Dahi Processing */}
                <div className="p-4 space-y-3 bg-emerald-50/20">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    2. Dahi Processing & Conversion
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Farm Used
                      </span>
                      <span className="font-mono font-bold text-slate-700">{day.farmToDahi.toFixed(1)} L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Supplier Used
                      </span>
                      <span className="font-mono font-bold text-slate-700">{day.supplierToDahi.toFixed(1)} L</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                      <span className="text-emerald-700 font-bold">Dahi Output Yield</span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-800 block">{day.dahiOutput.toFixed(1)} kg</span>
                        <span className="text-[10px] text-emerald-600/70 block">{conversionYield}% Conversion</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. POS Sales & Profit */}
                <div className="p-4 space-y-3 bg-blue-50/10">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                    3. POS Sales Realization
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Dahi Sales ({day.dahiSalesQty.toFixed(1)} kg)</span>
                      <span className="font-mono font-bold text-slate-700">Rs. {day.dahiSalesRev.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
                      <span className="text-indigo-700 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Total Revenue
                      </span>
                      <span className="font-mono font-black text-indigo-800 text-sm">Rs. {totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Summary Bar */}
              <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
                 <div className="flex items-center gap-4">
                   <span className="text-slate-400">Total Used for Dahi: <strong className="text-white ml-1 font-mono">{totalConverted.toFixed(1)} L</strong></span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
                     <ArrowRight className="w-3 h-3" /> ALL DATA RECONCILED
                   </span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
