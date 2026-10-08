import React, { useMemo, useState } from 'react';
import { Calendar, Truck, ArrowRight, Droplets, Banknote, CheckCircle2, TrendingUp, Users, AlertCircle, Receipt, Scale } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { usePOSContext } from '@/context/POSContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';

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

export default function SupplierDailyReport() {
  const { intakeLogs = [], totals: intakeTotals = {} } = useIntakeContext() || {};
  const { suppliers = [] } = useSupplierContext() || {};
  const { supplierSalesHistory = [], salesHistory = [], inventoryMetrics = {} } = usePOSContext() || {};
  const { expenses = [] } = useSourcExpenseContext() || {};

  const [dateFilter, setDateFilter] = useState('today'); // 'today' (default) | 'week' | 'all' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expected daily procurement capacity from registered suppliers
  const expectedSupplierDailyCapacity = useMemo(() => {
    return suppliers.reduce(
      (sum, s) => sum + (Number(s.avgLiters || s.expectedDailyQuantity) || 0),
      0
    );
  }, [suppliers]);

  // Aggregate by Date (Purchases, POS Sales, Sourcing Expenses & Net Profit)
  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const todayStr = normalizeDateStr(new Date());

    const initDate = (d) => {
      if (!dates[d]) {
        dates[d] = {
          date: d,
          supplierIntake: 0,
          totalCost: 0,
          paidAmount: 0,
          pendingAmount: 0,
          supplierMilkSalesQty: 0,
          supplierMilkSalesRev: 0,
          supplierDahiSalesQty: 0,
          supplierDahiSalesRev: 0,
          supplierTotalSalesRev: 0,
          supplierExpensesTotal: 0,
          supplierNetProfit: 0,
          intakeEntries: [],
          saleItems: [],
          expenseItems: [],
        };
      }
    };

    // Always initialize today
    initDate(todayStr);

    // 1. Supplier Intakes / Purchases
    intakeLogs.forEach((log) => {
      const d = normalizeDateStr(log.date || log.createdAt);
      initDate(d);
      const qty = parseFloat(log.quantity || log.quantityLiters) || 0;
      const rate = parseFloat(log.ratePerLiter) || 220;
      const cost = parseFloat(log.totalCost || log.totalAmount) || (qty * rate);
      const paid = parseFloat(log.paidAmount) || (log.settlement === 'Paid' ? cost : 0);
      const pending = Math.max(0, cost - paid);

      dates[d].supplierIntake += qty;
      dates[d].totalCost += cost;
      dates[d].paidAmount += paid;
      dates[d].pendingAmount += pending;
      dates[d].intakeEntries.push(log);
    });

    // 2. POS Sales (Supplier Milk & Supplier Dahi / Mixed Supplier Share)
    const activeSupplierSales = supplierSalesHistory.length > 0 ? supplierSalesHistory : salesHistory;
    activeSupplierSales.forEach((sale) => {
      const d = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt || sale.formattedDate);
      initDate(d);

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const source = (item.source || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price) || 0));

        // If not using pre-segregated supplier collection, skip farm items
        if (supplierSalesHistory.length === 0 && source.includes('farm')) return;

        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt') || cat.includes('yogurt');

        if (isDahi) {
          dates[d].supplierDahiSalesQty += qty;
          dates[d].supplierDahiSalesRev += sub;
        } else {
          dates[d].supplierMilkSalesQty += qty;
          dates[d].supplierMilkSalesRev += sub;
        }
        dates[d].supplierTotalSalesRev += sub;
        dates[d].saleItems.push({
          name: item.name,
          quantity: qty,
          price: Number(item.price) || 0,
          subtotal: sub,
          isDahi,
        });
      });
    });

    // 3. Sourcing Expenses
    expenses.forEach((exp) => {
      const d = normalizeDateStr(exp.date || exp.createdAt);
      initDate(d);
      const amt = Number(exp.amount) || 0;
      dates[d].supplierExpensesTotal += amt;
      dates[d].expenseItems.push(exp);
    });

    // Compute Net Profit for each date:
    // (Supplier Milk Sales + Supplier Dahi Sales) - Supplier Purchase Cost - Supplier Expenses = Net Profit
    Object.values(dates).forEach((day) => {
      day.supplierNetProfit = day.supplierTotalSalesRev - day.totalCost - day.supplierExpensesTotal;
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
    if (dateFilter === 'custom') {
      return list.filter((item) => {
        if (startDate && item.date < startDate) return false;
        if (endDate && item.date > endDate) return false;
        return true;
      });
    }

    return list;
  }, [intakeLogs, supplierSalesHistory, salesHistory, expenses, dateFilter, startDate, endDate]);

  // Overall totals across the aggregated view
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalIntake += day.supplierIntake;
        acc.totalCost += day.totalCost;
        acc.totalPaid += day.paidAmount;
        acc.totalPending += day.pendingAmount;
        acc.totalMilkSalesQty += day.supplierMilkSalesQty;
        acc.totalDahiSalesQty += day.supplierDahiSalesQty;
        acc.totalSalesRev += day.supplierTotalSalesRev;
        acc.totalExpenses += day.supplierExpensesTotal;
        acc.totalNetProfit += day.supplierNetProfit;
        return acc;
      },
      {
        totalIntake: 0,
        totalCost: 0,
        totalPaid: 0,
        totalPending: 0,
        totalMilkSalesQty: 0,
        totalDahiSalesQty: 0,
        totalSalesRev: 0,
        totalExpenses: 0,
        totalNetProfit: 0,
      }
    );
  }, [aggregatedByDate]);

  const avgPurchaseRate = overallTotals.totalIntake > 0 ? (overallTotals.totalCost / overallTotals.totalIntake).toFixed(1) : '240';
  const overallMargin = overallTotals.totalSalesRev > 0 ? Math.round((overallTotals.totalNetProfit / overallTotals.totalSalesRev) * 100) : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Header & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Truck className="w-4.5 h-4.5 text-blue-600" />
            Supplier Daily Milk &amp; Finance Report
          </h2>
        </div>

        {/* Date Filter Buttons & Custom Range Inputs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            {['today', 'week', 'all', 'custom'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setDateFilter(filter);
                  if (filter !== 'custom') {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dateFilter === filter
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'today' ? 'Today' : filter === 'week' ? 'Last 7 Days' : filter === 'custom' ? 'Custom Range' : 'All History'}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 cursor-pointer"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setDateFilter('all');
                  }}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Soft Tastefully Colorful Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-linear-to-br from-blue-50/80 via-sky-50/30 to-white border border-blue-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Total Milk Purchased</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-blue-950">{overallTotals.totalIntake.toFixed(1)}</span>
            <span className="text-xs font-semibold text-blue-700">Liters</span>
          </div>
          <span className="text-[10px] text-blue-700 mt-1 block font-medium">Cost: Rs. {overallTotals.totalCost.toLocaleString()} (@ Rs. {avgPurchaseRate}/L)</span>
        </div>

        <div className="bg-linear-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Milk &amp; Dahi Sales</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-950">Rs. {overallTotals.totalSalesRev.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block font-medium">
            {overallTotals.totalMilkSalesQty.toFixed(1)}L Milk • {overallTotals.totalDahiSalesQty.toFixed(1)}kg Dahi
          </span>
        </div>

        <div className="bg-linear-to-br from-amber-50/80 via-orange-50/30 to-white border border-amber-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Supplier Expenses</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-amber-950">Rs. {overallTotals.totalExpenses.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-amber-700 mt-1 block font-medium">Collection &amp; chilling cost</span>
        </div>

        <div className="bg-linear-to-br from-indigo-50/80 via-purple-50/30 to-white border border-indigo-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">Net Profit</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-xl font-black font-mono ${
              overallTotals.totalNetProfit >= 0 ? 'text-indigo-950' : 'text-rose-700'
            }`}>
              {overallTotals.totalNetProfit >= 0 ? '+' : '-'} Rs. {Math.abs(overallTotals.totalNetProfit).toLocaleString()}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              overallTotals.totalNetProfit >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60' : 'bg-rose-100 text-rose-800 border border-rose-300/60'
            }`}>
              {overallMargin}%
            </span>
          </div>
          <span className="text-[10px] text-indigo-700 mt-1 block font-medium">Sales - Milk Cost - Exp</span>
        </div>

        <div className="bg-linear-to-br from-orange-50/80 via-amber-50/30 to-white border border-orange-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">Supplier Balance Due</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-orange-950">Rs. {overallTotals.totalPending.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-orange-700 mt-1 block font-medium">Paid Settled: Rs. {overallTotals.totalPaid.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. Daily Breakdown Cards (Purchases, POS Sales, Expenses & Net Profit) */}
      <div className="space-y-4">
        {aggregatedByDate.map((day) => {
          const isToday = day.date === normalizeDateStr(new Date());
          const isProfitable = day.supplierNetProfit >= 0;

          return (
            <div key={day.date} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Header Bar */}
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      Today (Live)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Purchases:</span>
                    <strong className="font-bold font-mono text-rose-600">
                      - Rs. {day.totalCost.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Sales:</span>
                    <strong className="font-bold font-mono text-emerald-700">
                      + Rs. {day.supplierTotalSalesRev.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Expenses:</span>
                    <strong className="font-bold font-mono text-amber-700">
                      - Rs. {day.supplierExpensesTotal.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-400">Net:</span>
                    <strong className={`font-bold font-mono px-2 py-0.5 rounded ${
                      isProfitable ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isProfitable ? '+' : '-'} Rs. {Math.abs(day.supplierNetProfit).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Data Grid: 3 Columns (Procurement/Purchases, POS Resale, Expenses) */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
                {/* Col 1: Milk Purchased from Suppliers */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>Milk Purchased from Suppliers</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.intakeEntries.length} Invoices
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Volume Purchased</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {day.supplierIntake.toFixed(1)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Purchase Total Bill</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        Rs. {day.totalCost.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-emerald-700 font-medium">Paid: Rs. {day.paidAmount.toLocaleString()}</span>
                      <span className="font-bold text-amber-700">Due: Rs. {day.pendingAmount.toLocaleString()}</span>
                    </div>

                    {day.intakeEntries.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Purchases Log ({day.intakeEntries.length})
                        </span>
                        <div className="max-h-20 overflow-y-auto space-y-1">
                          {day.intakeEntries.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                              <span className="truncate pr-1">{log.supplierName || 'Supplier'} ({log.quantity}L)</span>
                              <span className="font-mono font-semibold text-slate-800 shrink-0">Rs. {Number(log.totalCost).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 2: POS Resale (Milk + Dahi) */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Supplier Milk &amp; Dahi Sales</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.saleItems.length} Sales Items
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Supplier Milk Sold</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {day.supplierMilkSalesQty.toFixed(1)} L (Rs. {day.supplierMilkSalesRev.toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Supplier Dahi Sold</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {day.supplierDahiSalesQty.toFixed(1)} kg (Rs. {day.supplierDahiSalesRev.toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-700 font-semibold">Total Sales Revenue</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        Rs. {day.supplierTotalSalesRev.toLocaleString()}
                      </span>
                    </div>

                    {day.saleItems.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Sales Items Log
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

                {/* Col 3: Sourcing Expenses & Net Profit */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      <span>Supplier Expenses &amp; Profit</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.expenseItems.length} Vouchers
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Supplier Sourcing Cost</span>
                      <span className="font-mono font-bold text-amber-700 text-sm">
                        Rs. {day.supplierExpensesTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-700 font-semibold">Net Profit</span>
                      <span className={`font-mono font-bold text-sm ${
                        isProfitable ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isProfitable ? '+' : '-'} Rs. {Math.abs(day.supplierNetProfit).toLocaleString()}
                      </span>
                    </div>

                    {day.expenseItems.length > 0 ? (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
                      <p className="text-[11px] text-slate-400 italic pt-2">No overhead expenses for this date.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Footer Bar */}
              <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-400">
                  Procurement Status:{' '}
                  <strong className="text-white ml-1 font-mono">
                    {day.intakeEntries.length} Milk Deliveries
                  </strong>
                </span>
                <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED (SALES - PURCHASE COST - EXPENSES = NET PROFIT)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
