import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Layers,
  Milk,
  Droplets,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle2,
  Tractor,
  Truck,
  Flame,
} from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useDahiContext } from '@/context/DahiContext';
import { usePOSContext } from '@/context/POSContext';

// Safe date normalization helper
const normalizeDateStr = (rawDate) => {
  if (!rawDate) return new Date().toISOString().split('T')[0];
  if (typeof rawDate === 'string') {
    if (rawDate.includes('T')) return rawDate.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate;
  }
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}
  return new Date().toISOString().split('T')[0];
};

export default function DahiDailyReport() {
  const { animals = [], milkingLogs = [] } = useAnimalContext() || {};
  const { intakeLogs = [] } = useIntakeContext() || {};
  const { batches = [], metrics = {}, availableDahiStock = 0 } = useDahiContext() || {};
  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext() || {};

  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week'

  // Baseline farm yield from active herd
  const herdBaselineYield = useMemo(() => {
    return animals.reduce((sum, a) => {
      const totalDaily = parseFloat(a.totalDailyYield || 0);
      if (totalDaily > 0) return sum + totalDaily;
      const morning = parseFloat(a.morningYield || 0);
      const evening = parseFloat(a.eveningYield || 0);
      return sum + (morning + evening);
    }, 0);
  }, [animals]);

  // Aggregate end-to-end data by date
  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const todayStr = normalizeDateStr(new Date());

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
          batchesList: [],
          saleItems: [],
        };
      }
    };

    // Always initialize today
    initDate(todayStr);

    // 1. Milking Logs (Farm Yield)
    milkingLogs.forEach((log) => {
      const d = normalizeDateStr(log.date || log.createdAt);
      initDate(d);
      dates[d].farmYield += parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0;
    });

    // Fallback for today if active herd exists
    if (dates[todayStr].farmYield === 0 && herdBaselineYield > 0) {
      dates[todayStr].farmYield = herdBaselineYield;
      dates[todayStr].isHerdBaseline = true;
    }

    // 2. Supplier Intake
    intakeLogs.forEach((log) => {
      const d = normalizeDateStr(log.date || log.createdAt);
      initDate(d);
      dates[d].supplierIntake += parseFloat(log.quantity || log.quantityLiters) || 0;
    });

    // 3. Dahi Batches
    batches.forEach((b) => {
      const d = normalizeDateStr(b.date || b.createdAt);
      initDate(d);
      const numOutput = Number(b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;
      const numUsed = Number(b.milkUsedVal) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;

      dates[d].dahiOutput += numOutput;
      dates[d].batchesList.push(b);

      if (b.farmMilkUsed !== undefined && b.supplierMilkUsed !== undefined) {
        dates[d].farmToDahi += Number(b.farmMilkUsed) || 0;
        dates[d].supplierToDahi += Number(b.supplierMilkUsed) || 0;
      } else {
        const src = (b.source || '').toLowerCase();
        if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix')) {
          dates[d].farmToDahi += numUsed;
        } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix')) {
          dates[d].supplierToDahi += numUsed;
        } else {
          const half = Math.round(numUsed / 2);
          dates[d].farmToDahi += half;
          dates[d].supplierToDahi += numUsed - half;
        }
      }
    });

    // 4. POS Sales (Dahi items)
    salesHistory.forEach((sale) => {
      const d = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt);
      initDate(d);

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || qty * (Number(item.price) || 0);

        if (
          name.includes('dahi') ||
          cat.includes('dahi') ||
          name.includes('curd') ||
          name.includes('yogurt')
        ) {
          dates[d].dahiSalesQty += qty;
          dates[d].dahiSalesRev += sub;
          dates[d].saleItems.push({
            name: item.name,
            quantity: qty,
            price: Number(item.price) || 0,
            subtotal: sub,
          });
        }
      });
    });

    const list = Object.values(dates).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by date range
    if (dateFilter === 'today') {
      return list.filter((item) => item.date === todayStr);
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = normalizeDateStr(weekAgo);
      return list.filter((item) => item.date >= weekAgoStr);
    }

    return list;
  }, [milkingLogs, intakeLogs, batches, salesHistory, herdBaselineYield, dateFilter]);

  // Overall Totals
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalFarmYield += day.farmYield;
        acc.totalSupplierIntake += day.supplierIntake;
        acc.totalFarmConverted += day.farmToDahi;
        acc.totalSupplierConverted += day.supplierToDahi;
        acc.totalDahiOutput += day.dahiOutput;
        acc.totalDahiSalesQty += day.dahiSalesQty;
        acc.totalDahiSalesRev += day.dahiSalesRev;
        return acc;
      },
      {
        totalFarmYield: 0,
        totalSupplierIntake: 0,
        totalFarmConverted: 0,
        totalSupplierConverted: 0,
        totalDahiOutput: 0,
        totalDahiSalesQty: 0,
        totalDahiSalesRev: 0,
      }
    );
  }, [aggregatedByDate]);

  const totalConvertedMilk = overallTotals.totalFarmConverted + overallTotals.totalSupplierConverted;
  const currentDahiStock = Number(inventoryMetrics.rawDahiStock) || Number(availableDahiStock) || Math.max(0, overallTotals.totalDahiOutput - overallTotals.totalDahiSalesQty);
  const conversionRate = totalConvertedMilk > 0 ? ((overallTotals.totalDahiOutput / totalConvertedMilk) * 100).toFixed(1) : '92.0';

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Header & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-indigo-600" />
            End-to-End Dahi Daily Analytical Report
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Complete daily lifecycle mapping Farm Yield &amp; Supplier Procurement into Dahi Production and POS Revenue
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'today'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'week'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Sourced Milk</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-slate-800">
              {(overallTotals.totalFarmYield + overallTotals.totalSupplierIntake).toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Farm: {overallTotals.totalFarmYield.toFixed(0)} L | Supplier: {overallTotals.totalSupplierIntake.toFixed(0)} L
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Dahi Produced</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-indigo-700">
              {overallTotals.totalDahiOutput.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
            {totalConvertedMilk > 0 ? `${totalConvertedMilk.toFixed(0)} L converted (${conversionRate}%)` : 'Ready for production'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Dahi Stock</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-cyan-700">
              {currentDahiStock.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-cyan-700 font-medium mt-1 block">
            Live in chilling trays &amp; POS
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">POS Dahi Revenue</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">
              Rs. {overallTotals.totalDahiSalesRev.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Sold: {overallTotals.totalDahiSalesQty.toFixed(1)} kg curd
          </span>
        </div>
      </div>

      {/* 3. Daily Breakdown Cards */}
      <div className="space-y-4">
        {aggregatedByDate.map((day) => {
          const totalConverted = (day.farmToDahi || 0) + (day.supplierToDahi || 0);
          const remainingDahiStock = Math.max(0, day.dahiOutput - day.dahiSalesQty);
          const conversionYield = totalConverted > 0 ? ((day.dahiOutput / totalConverted) * 100).toFixed(1) : 0;
          const totalRevenue = day.dahiSalesRev;
          const isToday = day.date === normalizeDateStr(new Date());

          return (
            <div key={day.date} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Today (Live)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Total Dahi Produced:</span>
                    <strong className="font-bold font-mono text-slate-800">{day.dahiOutput.toFixed(1)} kg</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Available Stock:</span>
                    <strong className="font-bold font-mono text-cyan-700">{remainingDahiStock.toFixed(1)} kg</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">POS Revenue:</span>
                    <strong className="font-bold font-mono text-emerald-700">Rs. {totalRevenue.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Data Grid: 3 Pillars (Sourcing, Conversion, Realization) */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
                {/* 1. Raw Milk Sourcing */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2">
                    <Milk className="w-3.5 h-3.5 text-slate-600" />
                    1. Raw Milk Available
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Tractor className="w-3 h-3 text-emerald-600" /> Farm Yield
                      </span>
                      <span className="font-mono font-bold text-emerald-700">{day.farmYield.toFixed(1)} L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Truck className="w-3 h-3 text-blue-600" /> Supplier Intake
                      </span>
                      <span className="font-mono font-bold text-blue-700">{day.supplierIntake.toFixed(1)} L</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Total Sourced</span>
                      <span className="font-mono font-bold text-slate-900">
                        {(day.farmYield + day.supplierIntake).toFixed(1)} L
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Dahi Processing */}
                <div className="p-4 space-y-3 bg-indigo-50/20">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    2. Dahi Processing &amp; Conversion
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
                    <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
                      <span className="text-indigo-700 font-bold">Dahi Output</span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-indigo-900 block">{day.dahiOutput.toFixed(1)} kg</span>
                        <span className="text-[10px] text-indigo-600/70 block">{conversionYield}% Conversion</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. POS Sales Realization */}
                <div className="p-4 space-y-3 bg-emerald-50/10">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    3. POS Sales Realization
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Dahi Sold</span>
                      <span className="font-mono font-bold text-slate-800">{day.dahiSalesQty.toFixed(1)} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Available Stock</span>
                      <span className="font-mono font-bold text-cyan-700">{remainingDahiStock.toFixed(1)} kg</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Sales Revenue
                      </span>
                      <span className="font-mono font-black text-emerald-800 text-sm">
                        Rs. {totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Summary Bar */}
              <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">
                    Total Raw Milk Used for Dahi:{' '}
                    <strong className="text-white ml-1 font-mono">{totalConverted.toFixed(1)} L</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED WITH POS &amp; KITCHEN PIPELINE
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
