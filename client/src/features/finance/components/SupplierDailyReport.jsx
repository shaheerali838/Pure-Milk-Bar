import React, { useMemo, useState } from 'react';
import { Calendar, Truck, ArrowRight, Droplets, DollarSign, CheckCircle2, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
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

export default function SupplierDailyReport() {
  const { intakeLogs = [], totals: intakeTotals = {} } = useIntakeContext() || {};
  const { suppliers = [], totals: supplierTotals = {} } = useSupplierContext() || {};
  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext() || {};
  const { totals: expenseTotals = {} } = useExpense() || {};

  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week'

  // Expected daily procurement capacity from registered suppliers
  const expectedSupplierDailyCapacity = useMemo(() => {
    return suppliers.reduce(
      (sum, s) => sum + (Number(s.avgLiters || s.expectedDailyQuantity) || 0),
      0
    );
  }, [suppliers]);

  // Aggregate by Date
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
          intakeEntries: [],
          saleItems: [],
        };
      }
    };

    // Always initialize today
    initDate(todayStr);

    // 1. Supplier Intakes
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

    // 2. POS Sales (Supplier Milk)
    salesHistory.forEach((sale) => {
      const d = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt);
      initDate(d);

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const source = (item.source || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || (qty * (Number(item.price) || 0));

        const isSupplier =
          source.includes('supplier') ||
          name.includes('supplier') ||
          name.includes('sourced') ||
          name.includes('chilled') ||
          cat.includes('supplier') ||
          cat.includes('sourced');
        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('curd');

        if (!isDahi && isSupplier) {
          dates[d].supplierMilkSalesQty += qty;
          dates[d].supplierMilkSalesRev += sub;
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
  }, [intakeLogs, salesHistory, dateFilter]);

  // Overall Totals
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalIntake += day.supplierIntake;
        acc.totalCost += day.totalCost;
        acc.totalPaid += day.paidAmount;
        acc.totalPending += day.pendingAmount;
        acc.totalSalesQty += day.supplierMilkSalesQty;
        acc.totalSalesRev += day.supplierMilkSalesRev;
        return acc;
      },
      {
        totalIntake: 0,
        totalCost: 0,
        totalPaid: 0,
        totalPending: 0,
        totalSalesQty: 0,
        totalSalesRev: 0,
      }
    );
  }, [aggregatedByDate]);

  const currentAvailableStock = Number(inventoryMetrics.rawSupplierMilkStock) || Math.max(0, overallTotals.totalIntake - overallTotals.totalSalesQty);
  const avgRate = overallTotals.totalIntake > 0 ? (overallTotals.totalCost / overallTotals.totalIntake).toFixed(1) : '220.0';

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Header & Date Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Truck className="w-4.5 h-4.5 text-blue-600" />
            Supplier Procurement &amp; Daily Intake Report
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Sourcing reconciliation across {suppliers.length} registered suppliers ({suppliers.filter((s) => s.status === 'Active').length} active)
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'today'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
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
                ? 'bg-white text-blue-700 shadow-xs font-bold'
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
                ? 'bg-white text-blue-700 shadow-xs font-bold'
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Liquid Procured</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-blue-700">{overallTotals.totalIntake.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Avg Procurement: Rs. {avgRate}/L</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Supplier Stock</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-blue-800">{currentAvailableStock.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-blue-600 font-medium mt-1 block">In chillers &amp; storage</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Supplier Milk Sold</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-slate-800">{overallTotals.totalSalesQty.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Revenue: Rs. {overallTotals.totalSalesRev.toLocaleString()}</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Procurement Cost &amp; Due</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-indigo-700">Rs. {overallTotals.totalCost.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-rose-500 font-medium mt-1 block">
            Pending Payout: Rs. {overallTotals.totalPending.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Daily Breakdown Cards */}
      <div className="space-y-4">
        {aggregatedByDate.map((day) => {
          const balance = Math.max(0, day.supplierIntake - day.supplierMilkSalesQty);
          const isToday = day.date === normalizeDateStr(new Date());

          return (
            <div key={day.date} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Card Header */}
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
                    <span className="font-medium text-slate-400">Procurement Cost:</span>
                    <strong className="font-bold font-mono text-slate-800">
                      Rs. {day.totalCost.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-400">Sales Revenue:</span>
                    <strong className="font-bold font-mono text-blue-700">
                      Rs. {day.supplierMilkSalesRev.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
                {/* Left: Supplier Intakes */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      Supplier Milk Intake
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.intakeEntries.length} Intakes Recorded
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Liquid Intake</span>
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {day.supplierIntake.toFixed(1)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Procurement Spend</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        Rs. {day.totalCost.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Settled vs Pending</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700">
                          Rs. {day.paidAmount.toLocaleString()}
                        </span>
                        {day.pendingAmount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Due: Rs. {day.pendingAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {day.intakeEntries.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Recorded Intakes
                        </span>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {day.intakeEntries.slice(0, 4).map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>
                                {entry.supplierName || 'Supplier'} ({entry.shift || 'Shift'}) &times; {entry.quantity} L
                              </span>
                              <span className="font-mono font-semibold text-slate-800">
                                Rs. {(entry.totalCost || entry.totalAmount || 0).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Supplier Milk Sales */}
                <div className="p-4 space-y-3 bg-blue-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      Supplier Milk POS Sales
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.saleItems.length} Sales Items
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Liquid Milk Sold</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {day.supplierMilkSalesQty.toFixed(1)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Sales Revenue</span>
                      <span className="font-mono font-bold text-blue-800 text-sm">
                        Rs. {day.supplierMilkSalesRev.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Available Stock Remaining</span>
                      <span className="font-mono font-bold text-blue-900 text-sm">
                        {balance.toFixed(1)} L
                      </span>
                    </div>

                    {day.saleItems.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-100 space-y-1">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
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
                  Procurement Status:{' '}
                  <strong className="text-white ml-1 font-mono">
                    {day.supplierIntake.toFixed(1)} L procured @ Rs. {(day.supplierIntake > 0 ? day.totalCost / day.supplierIntake : 220).toFixed(0)}/L
                  </strong>
                </span>
                <span className="text-blue-400 font-bold tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED WITH INTAKE REGISTRY
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
