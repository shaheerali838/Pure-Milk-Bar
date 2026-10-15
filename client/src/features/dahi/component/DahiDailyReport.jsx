import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useDahiContext } from '@/context/DahiContext';
import { usePOSContext } from '@/context/POSContext';
import { parseCleanDate, isMatchingTimeframe, getLocalDate } from '@/utils/dateUtils';
import DashboardDateFilterBar from '@/components/common/DashboardDateFilterBar';
import DahiDailyReportDayCard from './DahiDailyReportDayCard';

export default function DahiDailyReport({ showFilterBar = false }) {
  const { milkingLogs = [] } = useAnimalContext() || {};
  const { intakeLogs = [] } = useIntakeContext() || {};
  const {
    batches = [],
    availableDahiStock = 0,
    dateRange = 'today',
    setDateRange,
    customFrom = '',
    setCustomFrom,
    customTo = '',
    setCustomTo,
  } = useDahiContext() || {};
  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext() || {};

  // Aggregate end-to-end data by date strictly adhering to active date boundary
  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const todayStr = getLocalDate();

    const initDate = (d) => {
      if (!d) return null;
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
      return dates[d];
    };

    // Always ensure today is initialized for single-day views
    if (dateRange === 'today' || dateRange === 'all') {
      initDate(todayStr);
    }

    // 1. Milking Logs (Farm Yield)
    milkingLogs.forEach((log) => {
      const d = parseCleanDate(log.date || log.createdAt);
      if (!d || !isMatchingTimeframe(d, dateRange, customFrom, customTo)) return;
      const target = initDate(d);
      if (target) {
        target.farmYield += parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0;
      }
    });

    // 2. Supplier Intake
    intakeLogs.forEach((log) => {
      const d = parseCleanDate(log.date || log.createdAt);
      if (!d || !isMatchingTimeframe(d, dateRange, customFrom, customTo)) return;
      const target = initDate(d);
      if (target) {
        target.supplierIntake += parseFloat(log.quantity || log.quantityLiters) || 0;
      }
    });

    // 3. Dahi Batches
    batches.forEach((b) => {
      const d = parseCleanDate(b.date || b.createdAt);
      if (!d || !isMatchingTimeframe(d, dateRange, customFrom, customTo)) return;
      const target = initDate(d);
      if (!target) return;

      const numOutput = Number(b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;
      const numUsed = Number(b.milkUsedVal) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;

      target.dahiOutput += numOutput;
      target.batchesList.push(b);

      const bCost =
        Number(b.dahiProductionCost || b.milkUsedCost) ||
        ((Number(b.farmMilkCost) || 0) + (Number(b.supplierMilkCost) || 0)) ||
        numUsed * (Number(b.unitCost) || 150);
      target.dahiInputCost += bCost;

      if (b.farmMilkUsed !== undefined && b.supplierMilkUsed !== undefined) {
        target.farmToDahi += Number(b.farmMilkUsed) || 0;
        target.supplierToDahi += Number(b.supplierMilkUsed) || 0;
      } else {
        const src = (b.source || '').toLowerCase();
        if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix')) {
          target.farmToDahi += numUsed;
        } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix')) {
          target.supplierToDahi += numUsed;
        } else {
          const half = Math.round(numUsed / 2);
          target.farmToDahi += half;
          target.supplierToDahi += numUsed - half;
        }
      }
    });

    // 4. POS Sales (Dahi items, strictly within active date boundary)
    salesHistory.forEach((sale) => {
      const d = parseCleanDate(sale.date || sale.timestamp || sale.createdAt);
      if (!d || !isMatchingTimeframe(d, dateRange, customFrom, customTo)) return;
      const target = initDate(d);
      if (!target) return;

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || qty * (Number(item.price) || 0);

        const isDahi =
          name.includes('dahi') || cat.includes('dahi') || name.includes('curd') || name.includes('yogurt');

        if (isDahi) {
          const fRatio =
            item.farmRatio !== undefined
              ? Number(item.farmRatio)
              : item.source === 'Farm'
              ? 1
              : item.source === 'Supplier'
              ? 0
              : 0.5;
          const sRatio =
            item.supplierRatio !== undefined
              ? Number(item.supplierRatio)
              : item.source === 'Supplier'
              ? 1
              : item.source === 'Farm'
              ? 0
              : 0.5;

          const fRev = Math.round(sub * fRatio);
          const sRev = sub - fRev;

          target.dahiSalesQty += qty;
          target.dahiSalesRev += sub;
          target.dahiFarmRev += fRev;
          target.dahiSupplierRev += sRev;

          target.saleItems.push({
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

    // Compute net profit per day
    Object.values(dates).forEach((day) => {
      if (!day.dahiInputCost || day.dahiInputCost === 0) {
        day.dahiInputCost = Math.round(day.farmToDahi * 150 + day.supplierToDahi * 180);
      }
      day.dahiNetGain = day.dahiSalesRev - day.dahiInputCost;
    });

    return Object.values(dates).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [milkingLogs, intakeLogs, batches, salesHistory, dateRange, customFrom, customTo]);

  // Overall Totals strictly reduced from active timeframe
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalFarmYield += Number(day.farmYield) || 0;
        acc.totalSupplierIntake += Number(day.supplierIntake) || 0;
        acc.totalFarmConverted += Number(day.farmToDahi) || 0;
        acc.totalSupplierConverted += Number(day.supplierToDahi) || 0;
        acc.totalDahiOutput += Number(day.dahiOutput) || 0;
        acc.totalDahiSalesQty += Number(day.dahiSalesQty) || 0;
        acc.totalDahiSalesRev += Number(day.dahiSalesRev) || 0;
        acc.totalFarmRev += Number(day.dahiFarmRev) || 0;
        acc.totalSupplierRev += Number(day.dahiSupplierRev) || 0;
        acc.totalInputCost += Number(day.dahiInputCost) || 0;
        acc.totalNetGain += Number(day.dahiNetGain) || 0;
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

  // Decoupled physical stock: Absolute real-time inventory snapshot independent of time filters
  const currentDahiStock = Number(
    inventoryMetrics?.rawTotalDahiStock ??
    inventoryMetrics?.rawDahiStock ??
    availableDahiStock ??
    0
  );

  const conversionRate =
    totalConvertedMilk > 0
      ? ((overallTotals.totalDahiOutput / totalConvertedMilk) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Report Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-indigo-600" />
            Dahi Production, Sales &amp; Segregation Report
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Production batches, POS sales segregation, and net margin performance
          </p>
        </div>
      </div>

      {/* Standardized Date & Time Filter Bar (rendered when standalone / showFilterBar=true) */}
      {showFilterBar && (
        <DashboardDateFilterBar
          dateFilter={dateRange}
          onFilterChange={setDateRange}
          startDate={customFrom}
          endDate={customTo}
          onStartDateChange={setCustomFrom}
          onEndDateChange={setCustomTo}
          theme="blue"
        />
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Dahi Produced
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-indigo-700">
              {overallTotals.totalDahiOutput.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Yield Efficiency: {conversionRate}%
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Raw Milk Converted
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-slate-800">
              {totalConvertedMilk.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Farm: {overallTotals.totalFarmConverted.toFixed(1)}L • Supplier: {overallTotals.totalSupplierConverted.toFixed(1)}L
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Dahi POS Sales
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">
              Rs. {overallTotals.totalDahiSalesRev.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {overallTotals.totalDahiSalesQty.toFixed(1)} kg sold to customers
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Sales Revenue Split
          </span>
          <div className="flex items-center justify-between mt-1 text-xs font-mono font-bold">
            <span className="text-emerald-700">Farm: Rs. {overallTotals.totalFarmRev.toLocaleString()}</span>
            <span className="text-blue-700">Sup: Rs. {overallTotals.totalSupplierRev.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            Allocated by batch sourcing ratio
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Available Dahi Stock
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-indigo-700">
              {currentDahiStock.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
            Counter ready stock
          </span>
        </div>
      </div>

      {/* 3. Daily Breakdown Cards */}
      <div className="space-y-4">
        {aggregatedByDate.length > 0 ? (
          aggregatedByDate.map((day) => (
            <DahiDailyReportDayCard key={day.date} day={day} />
          ))
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-400">
            <p className="text-sm font-medium">No production or sales records found for the selected timeframe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
