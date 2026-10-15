import React, { useMemo, useState } from 'react';
import { Tractor } from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { usePOSContext } from '@/context/POSContext';
import { useExpense } from '@/context/ExpenseContext';
import { useDahiContext } from '@/context/DahiContext';
import { parseCleanDate, isMatchingTimeframe, getLocalDate } from '@/utils/dateUtils';
import DashboardDateFilterBar from '@/components/common/DashboardDateFilterBar';
import FarmDailyReportDayCard from './FarmDailyReportDayCard';

export default function FarmDailyReport() {
  const { animals = [], milkingLogs = [] } = useAnimalContext() || {};
  const { farmSalesHistory = [], salesHistory = [], inventoryMetrics = {} } = usePOSContext() || {};
  const { expenses = [] } = useExpense() || {};
  const { batches = [] } = useDahiContext() || {};

  const [dateFilter, setDateFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const milkingAnimalsCount = useMemo(() => {
    return animals.filter(
      (a) => a.lactationStatus === 'Milking' || parseFloat(a.totalDailyYield) > 0
    ).length;
  }, [animals]);

  // Build Daily Aggregations (Farm Production, Sales & Expenses Strictly Isolated)
  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const todayStr = getLocalDate();

    const initDate = (d) => {
      if (!d) return null;
      if (!dates[d]) {
        dates[d] = {
          date: d,
          farmYield: 0,
          farmMilkSalesQty: 0,
          farmMilkSalesRev: 0,
          farmDahiSalesQty: 0,
          farmDahiSalesRev: 0,
          farmMilkConvertedToDahi: 0,
          farmDahiProductionCost: 0,
          farmTotalSalesRev: 0,
          farmExpensesTotal: 0,
          farmNetProfit: 0,
          shiftLogs: [],
          saleItems: [],
          expenseItems: [],
        };
      }
      return dates[d];
    };

    // Always ensure today is initialized for single-day views
    if (dateFilter === 'today' || dateFilter === 'all') {
      initDate(todayStr);
    }

    // Milking Logs (Farm Milking Shifts)
    milkingLogs.forEach((log) => {
      const d = parseCleanDate(log.date || log.createdAt);
      if (!d || !isMatchingTimeframe(d, dateFilter, startDate, endDate)) return;
      const target = initDate(d);
      if (target) {
        const y = parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0;
        target.farmYield += y;
        target.shiftLogs.push(log);
      }
    });

    // POS Sales (Direct Farm Milk and Farm Dahi / Mixed Farm Share)
    const activeFarmSales = farmSalesHistory.length > 0 ? farmSalesHistory : salesHistory;
    activeFarmSales.forEach((sale) => {
      const d = parseCleanDate(sale.date || sale.timestamp || sale.createdAt);
      if (!d || !isMatchingTimeframe(d, dateFilter, startDate, endDate)) return;
      const target = initDate(d);
      if (!target) return;

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const source = (item.source || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal || item.effectiveRevenue) || qty * (Number(item.price) || 0);

        if (farmSalesHistory.length === 0 && source.includes('supplier')) return;

        const isDahi =
          name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt') || cat.includes('yogurt');

        if (isDahi) {
          target.farmDahiSalesQty += qty;
          target.farmDahiSalesRev += sub;
        } else {
          target.farmMilkSalesQty += qty;
          target.farmMilkSalesRev += sub;
        }
        target.farmTotalSalesRev += sub;
        target.saleItems.push({
          name: item.name,
          quantity: qty,
          price: Number(item.price) || 0,
          subtotal: sub,
          isDahi,
        });
      });
    });

    // Dahi Batches (Farm milk used and Dahi production costs)
    batches.forEach((b) => {
      const src = (b.source || '').toLowerCase();
      const isSupplierOnly =
        src.includes('supplier') && !src.includes('farm') && !src.includes('mix') && !src.includes('both');
      if (isSupplierOnly) return;

      const d = parseCleanDate(b.date || b.createdAt);
      if (!d || !isMatchingTimeframe(d, dateFilter, startDate, endDate)) return;
      const target = initDate(d);
      if (!target) return;

      const numUsed = Number(b.milkUsedVal) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;
      let fUsed = 0;
      if (b.farmMilkUsed !== undefined) {
        fUsed = Number(b.farmMilkUsed) || 0;
      } else if (src.includes('farm') && !src.includes('supplier')) {
        fUsed = numUsed;
      } else {
        fUsed = Math.round(numUsed * (b.farmRatio !== undefined ? Number(b.farmRatio) : 0.5));
      }

      const fCost = Number(b.farmMilkCost) || Math.round(fUsed * (Number(b.unitCost) || 150));
      target.farmMilkConvertedToDahi += fUsed;
      target.farmDahiProductionCost += fCost;
    });

    // Farm Expenses
    expenses.forEach((exp) => {
      const d = parseCleanDate(exp.date || exp.createdAt);
      if (!d || !isMatchingTimeframe(d, dateFilter, startDate, endDate)) return;
      const target = initDate(d);
      if (!target) return;
      const amt = Number(exp.amount) || 0;
      target.farmExpensesTotal += amt;
      target.expenseItems.push(exp);
    });

    // Compute Net Profit for each date: Sales - Expenses - Dahi Production Cost
    Object.values(dates).forEach((day) => {
      day.farmNetProfit = day.farmTotalSalesRev - day.farmExpensesTotal - day.farmDahiProductionCost;
    });

    return Object.values(dates).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [milkingLogs, farmSalesHistory, salesHistory, expenses, batches, dateFilter, startDate, endDate]);

  // Overall totals strictly reduced from active timeframe
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalYield += Number(day.farmYield) || 0;
        acc.totalMilkSalesQty += Number(day.farmMilkSalesQty) || 0;
        acc.totalDahiSalesQty += Number(day.farmDahiSalesQty) || 0;
        acc.totalFarmMilkConvertedToDahi += Number(day.farmMilkConvertedToDahi) || 0;
        acc.totalDahiProductionCost += Number(day.farmDahiProductionCost) || 0;
        acc.totalSalesRev += Number(day.farmTotalSalesRev) || 0;
        acc.totalExpenses += Number(day.farmExpensesTotal) || 0;
        acc.totalNetProfit += Number(day.farmNetProfit) || 0;
        return acc;
      },
      {
        totalYield: 0,
        totalMilkSalesQty: 0,
        totalDahiSalesQty: 0,
        totalFarmMilkConvertedToDahi: 0,
        totalDahiProductionCost: 0,
        totalSalesRev: 0,
        totalExpenses: 0,
        totalNetProfit: 0,
      }
    );
  }, [aggregatedByDate]);

  // Decoupled physical stock: Absolute real-time inventory snapshot
  const currentAvailableStock = Number(
    inventoryMetrics?.rawAvailableFarmStock ??
    inventoryMetrics?.availableFarmStock ??
    inventoryMetrics?.rawFarmMilkStock ??
    0
  );

  const overallMargin =
    overallTotals.totalSalesRev > 0
      ? Math.round((overallTotals.totalNetProfit / overallTotals.totalSalesRev) * 100)
      : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Report Title Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Tractor className="w-4.5 h-4.5 text-emerald-600" />
            Farm Daily Production, Sales &amp; Expenses Report
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time daily yield, POS milk &amp; Dahi sales, operating expenses, and net profit
          </p>
        </div>
      </div>

      {/* 2. Standardized Universal Date & Time Filter Bar */}
      <DashboardDateFilterBar
        dateFilter={dateFilter}
        onFilterChange={setDateFilter}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        theme="emerald"
      />

      {/* 3. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Milk Yield
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">
              {overallTotals.totalYield.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Herd Base: {milkingAnimalsCount} Cows In-Milk
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Farm Sales Revenue
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-800">
              Rs. {overallTotals.totalSalesRev.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Milk: {overallTotals.totalMilkSalesQty.toFixed(1)}L • Dahi: {overallTotals.totalDahiSalesQty.toFixed(1)}kg
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Farm Expenses
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-rose-600">
              Rs. {overallTotals.totalExpenses.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Operating vouchers &amp; feed</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Net Farm Profit
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-xl font-black font-mono ${
                overallTotals.totalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              Rs. {overallTotals.totalNetProfit.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            Net Profit Margin: {overallMargin}%
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Available Farm Stock
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-800">
              {currentAvailableStock.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
            Live stock ready for POS
          </span>
        </div>
      </div>

      {/* 4. Daily Breakdown Cards */}
      <div className="space-y-4">
        {aggregatedByDate.length > 0 ? (
          aggregatedByDate.map((day) => (
            <FarmDailyReportDayCard
              key={day.date}
              day={day}
              currentAvailableStock={currentAvailableStock}
              milkingAnimalsCount={milkingAnimalsCount}
            />
          ))
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-400">
            <p className="text-sm font-medium">No farm production or sales records found for the selected timeframe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
