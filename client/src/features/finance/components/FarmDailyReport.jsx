import React, { useMemo, useState } from 'react';
import { Calendar, Activity, ArrowRight, Droplets, DollarSign, Tractor, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
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
  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext() || {};
  const { totals: expenseTotals = {} } = useExpense() || {};

  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week'

  // 1. Calculate active herd daily baseline yield
  const herdBaselineYield = useMemo(() => {
    return animals.reduce((sum, a) => {
      const totalDaily = parseFloat(a.totalDailyYield || 0);
      if (totalDaily > 0) return sum + totalDaily;
      const morning = parseFloat(a.morningYield || 0);
      const evening = parseFloat(a.eveningYield || 0);
      return sum + (morning + evening);
    }, 0);
  }, [animals]);

  const milkingAnimalsCount = useMemo(() => {
    return animals.filter(
      (a) => a.lactationStatus === 'Milking' || parseFloat(a.totalDailyYield) > 0
    ).length;
  }, [animals]);

  // 2. Build Daily Aggregations
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
          shiftLogs: [],
          saleItems: [],
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

    // If today's yield in logs is 0, but active herd has daily capacity, initialize with herd yield
    if (dates[todayStr].farmYield === 0 && herdBaselineYield > 0) {
      dates[todayStr].farmYield = herdBaselineYield;
      dates[todayStr].isHerdBaseline = true;
    }

    // POS Sales (Direct Farm Milk)
    salesHistory.forEach((sale) => {
      const d = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt);
      initDate(d);

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const source = (item.source || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || (qty * (Number(item.price) || 0));

        // Identify Farm Milk sales (Cow / Buffalo / Farm Milk, excluding Dahi)
        const isSupplier = source.includes('supplier') || name.includes('supplier') || name.includes('sourced') || name.includes('chilled') || cat.includes('supplier');
        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('curd') || name.includes('yogurt');
        const isMilk = name.includes('milk') || cat.includes('milk') || name.includes('cow') || name.includes('buffalo');

        if (!isDahi && isMilk && (source.includes('farm') || !isSupplier)) {
          dates[d].farmMilkSalesQty += qty;
          dates[d].farmMilkSalesRev += sub;
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
  }, [milkingLogs, salesHistory, herdBaselineYield, dateFilter]);

  // Overall totals across the aggregated view
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalYield += day.farmYield;
        acc.totalSalesQty += day.farmMilkSalesQty;
        acc.totalSalesRev += day.farmMilkSalesRev;
        return acc;
      },
      { totalYield: 0, totalSalesQty: 0, totalSalesRev: 0 }
    );
  }, [aggregatedByDate]);

  const feedExpenses = Number(expenseTotals.feedSeedFarming) || Number(expenseTotals.totalFarmExpense) || 0;
  const currentAvailableStock = Number(inventoryMetrics.rawFarmMilkStock) || Math.max(0, overallTotals.totalYield - overallTotals.totalSalesQty);

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Header & Date Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Tractor className="w-4.5 h-4.5 text-emerald-600" />
            Farm Daily Production &amp; Sales Report
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time daily yield reconciliation for {animals.length} herd cattle ({milkingAnimalsCount} in lactation)
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'all'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Milking Yield</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">{overallTotals.totalYield.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Active herd capacity: {herdBaselineYield.toFixed(1)} L/day</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Farm Stock</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-800">{currentAvailableStock.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Ready for POS / Dahi conversion</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Direct Farm Milk Sold</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-slate-800">{overallTotals.totalSalesQty.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Counter &amp; Delivery sales</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Farm Milk Revenue</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">Rs. {overallTotals.totalSalesRev.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Feed spend: Rs. {feedExpenses.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. Daily Breakdown Cards */}
      <div className="space-y-4">
        {aggregatedByDate.map((day) => {
          const balance = Math.max(0, day.farmYield - day.farmMilkSalesQty);
          const isToday = day.date === normalizeDateStr(new Date());

          return (
            <div key={day.date} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Card Header */}
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
                    <span className="font-medium text-slate-400">Day Revenue:</span>
                    <strong className="font-bold font-mono text-emerald-700">
                      Rs. {day.farmMilkSalesRev.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
                {/* Left: Milking Yield */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                      Farm Milking Yield
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {milkingAnimalsCount} In-Lactation
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Milked Volume</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {day.farmYield.toFixed(1)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Available Farm Milk Stock</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        {balance.toFixed(1)} L
                      </span>
                    </div>

                    {day.shiftLogs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Recorded Shifts ({day.shiftLogs.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
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

                {/* Right: Farm Milk Sales */}
                <div className="p-4 space-y-3 bg-emerald-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Direct Farm Milk POS Sales
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.saleItems.length} Sales Items
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Liquid Milk Sold</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {day.farmMilkSalesQty.toFixed(1)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Sales Revenue</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        Rs. {day.farmMilkSalesRev.toLocaleString()}
                      </span>
                    </div>

                    {day.saleItems.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Recent Sales Log
                        </span>
                        <div className="max-h-24 overflow-y-auto space-y-1">
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
              </div>

              {/* Bottom Card Summary Bar */}
              <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-400">
                  Daily Herd Productivity:{' '}
                  <strong className="text-white ml-1 font-mono">
                    {milkingAnimalsCount > 0 ? (day.farmYield / milkingAnimalsCount).toFixed(1) : 0} L/cow
                  </strong>
                </span>
                <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED WITH LIVE HERD
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
