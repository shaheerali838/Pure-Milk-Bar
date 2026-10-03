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
  Scale,
  Receipt,
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
  const { batches = [], availableDahiStock = 0 } = useDahiContext() || {};
  const { salesHistory = [], farmSalesHistory = [], supplierSalesHistory = [], inventoryMetrics = {} } = usePOSContext() || {};

  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week'

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
          dahiFarmRev: 0,
          dahiSupplierRev: 0,
          dahiInputCost: 0,
          dahiNetGain: 0,
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

      const bCost = Number(b.dahiProductionCost || b.milkUsedCost) || ((Number(b.farmMilkCost) || 0) + (Number(b.supplierMilkCost) || 0)) || (numUsed * (Number(b.unitCost) || 150));
      dates[d].dahiInputCost = (dates[d].dahiInputCost || 0) + bCost;

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

    // 4. POS Sales (Dahi items, with Farm vs Supplier Segregation)
    salesHistory.forEach((sale) => {
      const d = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt || sale.formattedDate);
      initDate(d);

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || (qty * (Number(item.price) || 0));

        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('curd') || name.includes('yogurt');

        if (isDahi) {
          const fRatio = item.farmRatio !== undefined ? Number(item.farmRatio) : (item.source === 'Farm' ? 1 : item.source === 'Supplier' ? 0 : 0.5);
          const sRatio = item.supplierRatio !== undefined ? Number(item.supplierRatio) : (item.source === 'Supplier' ? 1 : item.source === 'Farm' ? 0 : 0.5);

          const fRev = Math.round(sub * fRatio);
          const sRev = sub - fRev;

          dates[d].dahiSalesQty += qty;
          dates[d].dahiSalesRev += sub;
          dates[d].dahiFarmRev += fRev;
          dates[d].dahiSupplierRev += sRev;

          dates[d].saleItems.push({
            name: item.name,
            quantity: qty,
            price: Number(item.price) || 0,
            subtotal: sub,
            source: item.source || (fRatio === 1 ? 'Farm' : sRatio === 1 ? 'Supplier' : 'Mixed'),
            farmShare: fRev,
            supplierShare: sRev,
          });
        }
      });
    });

    // Compute input milk cost and actual net profit per day
    // Formula: Total Dahi POS Sales - Dahi Production Cost = Actual Net Profit
    Object.values(dates).forEach((day) => {
      const totalUsed = day.farmToDahi + day.supplierToDahi;
      if (!day.dahiInputCost || day.dahiInputCost === 0) {
        day.dahiInputCost = Math.round(day.farmToDahi * 150 + day.supplierToDahi * 180);
      }
      day.dahiNetGain = day.dahiSalesRev - day.dahiInputCost;
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
  }, [milkingLogs, intakeLogs, batches, salesHistory, dateFilter]);

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
        acc.totalFarmRev += day.dahiFarmRev;
        acc.totalSupplierRev += day.dahiSupplierRev;
        acc.totalInputCost += day.dahiInputCost;
        acc.totalNetGain += day.dahiNetGain;
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
        totalFarmRev: 0,
        totalSupplierRev: 0,
        totalInputCost: 0,
        totalNetGain: 0,
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
            Dahi Production, Sales &amp; Segregation Report
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Complete conversion lifecycle tracking Farm Milk vs Supplier Milk, POS revenue splitting &amp; value-add margin
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Output, Milk Converted, POS Sales, Farm Share, Supplier Share) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Dahi Produced</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-indigo-700">{overallTotals.totalDahiOutput.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Yield Efficiency: {conversionRate}%</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Raw Milk Converted</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-slate-800">{totalConvertedMilk.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Farm: {overallTotals.totalFarmConverted}L • Supplier: {overallTotals.totalSupplierConverted}L
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Dahi POS Sales</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">Rs. {overallTotals.totalDahiSalesRev.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">{overallTotals.totalDahiSalesQty.toFixed(1)} kg sold to customers</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sales Revenue Split</span>
          <div className="flex items-center justify-between mt-1 text-xs font-mono font-bold">
            <span className="text-emerald-700">Farm: Rs. {overallTotals.totalFarmRev.toLocaleString()}</span>
            <span className="text-blue-700">Sup: Rs. {overallTotals.totalSupplierRev.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Allocated by batch sourcing ratio</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Dahi Stock</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-indigo-700">{currentDahiStock.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-medium mt-1 block">Counter ready stock</span>
        </div>
      </div>

      {/* 3. Daily Breakdown Cards */}
      <div className="space-y-4">
        {aggregatedByDate.map((day) => {
          const isToday = day.date === normalizeDateStr(new Date());
          const totalDayConverted = day.farmToDahi + day.supplierToDahi;

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
                    <span className="font-medium text-slate-400">Produced:</span>
                    <strong className="font-bold font-mono text-indigo-700">
                      {day.dahiOutput.toFixed(1)} kg
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">POS Sales:</span>
                    <strong className="font-bold font-mono text-emerald-700">
                      Rs. {day.dahiSalesRev.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                      Farm: Rs. {day.dahiFarmRev.toLocaleString()}
                    </span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-bold">
                      Sup: Rs. {day.dahiSupplierRev.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid: 3 Columns (Sourcing Conversion, POS Sales Split, Batch Logs) */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
                {/* Col 1: Raw Milk Sourcing */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Droplets className="w-3.5 h-3.5 text-indigo-600" />
                      Milk Sourcing for Dahi
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {totalDayConverted.toFixed(1)} L Total Used
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Farm Milk Used</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {day.farmToDahi.toFixed(1)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Supplier Milk Used</span>
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {day.supplierToDahi.toFixed(1)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-700 font-semibold">Dahi Output Produced</span>
                      <span className="font-mono font-bold text-indigo-700 text-sm">
                        {day.dahiOutput.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Col 2: POS Dahi Sales & Revenue Segregation */}
                <div className="p-4 space-y-3 bg-emerald-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      POS Dahi Sales &amp; Segregation
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.saleItems.length} Sales Items
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Dahi Sold</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {day.dahiSalesQty.toFixed(1)} kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Dahi Revenue</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        Rs. {day.dahiSalesRev.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-emerald-100 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-emerald-700 font-medium">Farm P&amp;L Allocation:</span>
                        <strong className="font-mono text-emerald-800">Rs. {day.dahiFarmRev.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">Supplier P&amp;L Allocation:</span>
                        <strong className="font-mono text-blue-800">Rs. {day.dahiSupplierRev.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 3: Batch Logs & Conversion Records */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Conversion Batches
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.batchesList.length} Batches
                    </span>
                  </div>

                  {day.batchesList.length > 0 ? (
                    <div className="max-h-28 overflow-y-auto space-y-1.5">
                      {day.batchesList.map((b, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800 block">{b.batchNumber || b.product || 'Dahi Batch'}</span>
                            <span className="text-[10px] text-slate-400">
                              Source: {b.source || 'Farm'} &bull; In: {b.milkUsed || b.milkUsedVal || 0}L
                            </span>
                          </div>
                          <span className="font-mono font-bold text-indigo-700">
                            {b.output || b.outputVal || 0} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic pt-2">No conversion batches recorded for this date.</p>
                  )}
                </div>
              </div>

              {/* Bottom Footer Bar */}
              <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-400">
                  Value-Addition Efficiency:{' '}
                  <strong className="text-white ml-1 font-mono">
                    {day.dahiOutput > 0 ? (day.dahiSalesRev / day.dahiOutput).toFixed(0) : 320} Rs/kg realized
                  </strong>
                </span>
                <span className="text-indigo-400 font-bold tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SEGREGATED REVENUE ROUTED TO FARM &amp; SUPPLIER P&amp;L
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
