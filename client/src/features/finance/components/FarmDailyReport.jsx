import React, { useMemo, useState } from 'react';
import { Calendar, Activity, ArrowRight, Droplets, DollarSign, Tractor, CheckCircle2, TrendingUp, Layers, Receipt, AlertCircle } from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { usePOSContext } from '@/context/POSContext';
import { useExpense } from '@/context/ExpenseContext';

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

export default function FarmDailyReport() {
  const { animals = [], milkingLogs = [] } = useAnimalContext() || {};
  const { farmSalesHistory = [], salesHistory = [], inventoryMetrics = {} } = usePOSContext() || {};
  const { expenses = [], totals: expenseTotals = {} } = useExpense() || {};

  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week'

  const milkingAnimalsCount = useMemo(() => {
    return animals.filter(
      (a) => a.lactationStatus === 'Milking' || parseFloat(a.totalDailyYield) > 0
    ).length;
  }, [animals]);

  // 2. Build Daily Aggregations (Farm Production, Sales & Expenses Strictly Isolated)
  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const todayStr = normalizeDateStr(new Date());

    const initDate = (d) => {
      if (!dates[d]) {
        dates[d] = {
          date: d,
          farmYield: 0,
          farmMilkSalesQty: 0,
          farmMilkSalesRev: 0,
          farmDahiSalesQty: 0,
          farmDahiSalesRev: 0,
          farmTotalSalesRev: 0,
          farmExpensesTotal: 0,
          farmNetProfit: 0,
          shiftLogs: [],
          saleItems: [],
          expenseItems: [],
        };
      }
    };

    // Always ensure today is initialized
    initDate(todayStr);

    // Milking Logs (Farm Milking Shifts)
    milkingLogs.forEach((log) => {
      const d = normalizeDateStr(log.date || log.createdAt);
      initDate(d);
      const y = parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0;
      dates[d].farmYield += y;
      dates[d].shiftLogs.push(log);
    });

    // POS Sales (Direct Farm Milk and Farm Dahi / Mixed Farm Share)
    const activeFarmSales = farmSalesHistory.length > 0 ? farmSalesHistory : salesHistory;
    activeFarmSales.forEach((sale) => {
      const d = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt || sale.formattedDate);
      initDate(d);

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const source = (item.source || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price) || 0));

        // Skip pure supplier items if not pre-segregated
        if (farmSalesHistory.length === 0 && source.includes('supplier')) return;

        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt') || cat.includes('yogurt');

        if (isDahi) {
          dates[d].farmDahiSalesQty += qty;
          dates[d].farmDahiSalesRev += sub;
        } else {
          dates[d].farmMilkSalesQty += qty;
          dates[d].farmMilkSalesRev += sub;
        }
        dates[d].farmTotalSalesRev += sub;
        dates[d].saleItems.push({
          name: item.name,
          quantity: qty,
          price: Number(item.price) || 0,
          subtotal: sub,
          isDahi,
        });
      });
    });

    // Farm Expenses
    expenses.forEach((exp) => {
      const d = normalizeDateStr(exp.date || exp.createdAt);
      initDate(d);
      const amt = Number(exp.amount) || 0;
      dates[d].farmExpensesTotal += amt;
      dates[d].expenseItems.push(exp);
    });

    // Compute Net Profit for each date: Sales - Expenses
    Object.values(dates).forEach((day) => {
      day.farmNetProfit = day.farmTotalSalesRev - day.farmExpensesTotal;
    });

    const list = Object.values(dates).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by date range if selected
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
  }, [milkingLogs, farmSalesHistory, salesHistory, expenses, herdBaselineYield, dateFilter]);

  // Overall totals across the aggregated view
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalYield += day.farmYield;
        acc.totalMilkSalesQty += day.farmMilkSalesQty;
        acc.totalDahiSalesQty += day.farmDahiSalesQty;
        acc.totalSalesRev += day.farmTotalSalesRev;
        acc.totalExpenses += day.farmExpensesTotal;
        acc.totalNetProfit += day.farmNetProfit;
        return acc;
      },
      { totalYield: 0, totalMilkSalesQty: 0, totalDahiSalesQty: 0, totalSalesRev: 0, totalExpenses: 0, totalNetProfit: 0 }
    );
  }, [aggregatedByDate]);

  const currentAvailableStock = Number(inventoryMetrics.rawFarmMilkStock) || Math.max(0, overallTotals.totalYield - overallTotals.totalMilkSalesQty);
  const overallMargin = overallTotals.totalSalesRev > 0 ? Math.round((overallTotals.totalNetProfit / overallTotals.totalSalesRev) * 100) : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Header & Date Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Tractor className="w-4.5 h-4.5 text-emerald-600" />
            Farm Daily Production, Sales &amp; Expenses Report
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time daily yield, POS milk &amp; Dahi sales, operating expenses, and net profit
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateFilter === 'today'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
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
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
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
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Production, Sales, Expenses, Net Profit, Stock) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Milking Yield</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">{overallTotals.totalYield.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Active herd: {milkingAnimalsCount} in milking</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Farm POS Sales</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">Rs. {overallTotals.totalSalesRev.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {overallTotals.totalMilkSalesQty.toFixed(1)}L Milk • {overallTotals.totalDahiSalesQty.toFixed(1)}kg Dahi
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Farm Expenses</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-rose-600">Rs. {overallTotals.totalExpenses.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-rose-500 font-medium mt-1 block">Feed, labor, vet, utility bills</span>
        </div>

        <div className={`border rounded-2xl p-3.5 shadow-2xs ${
          overallTotals.totalNetProfit >= 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Farm Net Profit (Bachat)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-xl font-black font-mono ${
              overallTotals.totalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {overallTotals.totalNetProfit >= 0 ? '+' : '-'} Rs. {Math.abs(overallTotals.totalNetProfit).toLocaleString()}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              overallTotals.totalNetProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {overallMargin}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono">Formula: Sales - Expenses</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Farm Stock</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-800">{currentAvailableStock.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Live stock ready for POS</span>
        </div>
      </div>

      {/* 3. Daily Breakdown Cards (Production, Sales, Expenses & Net Profit) */}
      <div className="space-y-4">
        {aggregatedByDate.map((day) => {
          const balance = Math.max(0, day.farmYield - day.farmMilkSalesQty);
          const isToday = day.date === normalizeDateStr(new Date());
          const isProfitable = day.farmNetProfit >= 0;

          return (
            <div key={day.date} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Card Header with Financial Snapshot */}
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Today (Live)
                    </span>
                  )}
                  {day.isHerdBaseline && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Herd Yield Baseline
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Sales:</span>
                    <strong className="font-bold font-mono text-emerald-700">
                      + Rs. {day.farmTotalSalesRev.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Expenses:</span>
                    <strong className="font-bold font-mono text-rose-600">
                      - Rs. {day.farmExpensesTotal.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-400">Net Profit:</span>
                    <strong className={`font-bold font-mono px-2 py-0.5 rounded ${
                      isProfitable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isProfitable ? '+' : '-'} Rs. {Math.abs(day.farmNetProfit).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Data Grid: 3 Columns (Production, POS Sales, Expenses) */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
                {/* Col 1: Milking Yield */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                      Farm Production Yield
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {milkingAnimalsCount} In-Milking
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Milked Volume</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {day.farmYield.toFixed(1)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Available Stock</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        {balance.toFixed(1)} L
                      </span>
                    </div>

                    {day.shiftLogs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Recorded Shifts ({day.shiftLogs.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {day.shiftLogs.map((log, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md"
                            >
                              {log.shift || 'Shift'}: {log.yieldLiters || log.yield} L ({log.animalTag || 'Cattle'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 2: Farm Sales (Milk + Dahi) */}
                <div className="p-4 space-y-3 bg-emerald-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Farm POS Sales (Milk &amp; Dahi)
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.saleItems.length} Sales Items
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Farm Milk Sold</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {day.farmMilkSalesQty.toFixed(1)} L (Rs. {day.farmMilkSalesRev.toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Farm Dahi Sold</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {day.farmDahiSalesQty.toFixed(1)} kg (Rs. {day.farmDahiSalesRev.toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-emerald-100">
                      <span className="text-slate-700 font-semibold">Total Day Sales</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        Rs. {day.farmTotalSalesRev.toLocaleString()}
                      </span>
                    </div>

                    {day.saleItems.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Recent Sales Log
                        </span>
                        <div className="max-h-20 overflow-y-auto space-y-1">
                          {day.saleItems.slice(0, 4).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>{item.name} &times; {item.quantity}</span>
                              <span className="font-mono font-semibold text-slate-800">Rs. {item.subtotal.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 3: Farm Operational Expenses */}
                <div className="p-4 space-y-3 bg-rose-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Receipt className="w-3.5 h-3.5 text-rose-600" />
                      Farm Expenses
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.expenseItems.length} Vouchers
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Day Total Expenses</span>
                      <span className="font-mono font-bold text-rose-600 text-sm">
                        Rs. {day.farmExpensesTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-rose-100">
                      <span className="text-slate-700 font-semibold">Day Net Profit</span>
                      <span className={`font-mono font-bold text-sm ${
                        isProfitable ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isProfitable ? '+' : '-'} Rs. {Math.abs(day.farmNetProfit).toLocaleString()}
                      </span>
                    </div>

                    {day.expenseItems.length > 0 ? (
                      <div className="mt-2 pt-2 border-t border-rose-100 space-y-1">
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                          Expense Vouchers
                        </span>
                        <div className="max-h-20 overflow-y-auto space-y-1">
                          {day.expenseItems.map((exp, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                              <span className="truncate pr-1">{exp.category || exp.title || 'Expense'}</span>
                              <span className="font-mono font-semibold text-rose-600 shrink-0">Rs. {Number(exp.amount).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic pt-2">No expenses logged for this day.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Summary Bar */}
              <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-400">
                  Daily Unit Performance:{' '}
                  <strong className="text-white ml-1 font-mono">
                    {milkingAnimalsCount > 0 ? (day.farmYield / milkingAnimalsCount).toFixed(1) : 0} L/cow
                  </strong>
                </span>
                <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED (SALES - EXPENSES = NET PROFIT)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
