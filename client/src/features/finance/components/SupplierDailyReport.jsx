import React, { useMemo, useState } from 'react';
import { Truck } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { usePOSContext } from '@/context/POSContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { parseCleanDate, isMatchingTimeframe, getLocalDate } from '@/utils/dateUtils';
import DashboardDateFilterBar from '@/components/common/DashboardDateFilterBar';
import SupplierDailyReportDayCard from './SupplierDailyReportDayCard';

export default function SupplierDailyReport() {
  const { intakeLogs = [] } = useIntakeContext() || {};
  const { suppliers = [] } = useSupplierContext() || {};
  const { supplierSalesHistory = [], salesHistory = [] } = usePOSContext() || {};
  const { expenses = [] } = useSourcExpenseContext() || {};

  const [dateFilter, setDateFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expected daily procurement capacity from registered suppliers
  const expectedSupplierDailyCapacity = useMemo(() => {
    return suppliers.reduce(
      (sum, s) => sum + (Number(s.avgLiters || s.expectedDailyQuantity) || 0),
      0
    );
  }, [suppliers]);

  // Aggregate by Date strictly adhering to active timeframe
  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const todayStr = getLocalDate();

    const initDate = (d) => {
      if (!d) return null;
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
      return dates[d];
    };

    // Always initialize today for single-day views
    if (dateFilter === 'today' || dateFilter === 'all') {
      initDate(todayStr);
    }

    // 1. Supplier Intakes / Purchases
    intakeLogs.forEach((log) => {
      const d = parseCleanDate(log.date || log.createdAt);
      if (!d || !isMatchingTimeframe(d, dateFilter, startDate, endDate)) return;
      const target = initDate(d);
      if (!target) return;

      const qty = parseFloat(log.quantity || log.quantityLiters) || 0;
      const rate = parseFloat(log.ratePerLiter) || 220;
      const cost = parseFloat(log.totalCost || log.totalAmount) || qty * rate;
      const paid = parseFloat(log.paidAmount) || (log.settlement === 'Paid' ? cost : 0);
      const pending = Math.max(0, cost - paid);

      target.supplierIntake += qty;
      target.totalCost += cost;
      target.paidAmount += paid;
      target.pendingAmount += pending;
      target.intakeEntries.push(log);
    });

    // 2. POS Sales (Supplier Milk & Supplier Dahi / Mixed Supplier Share)
    const activeSupplierSales = supplierSalesHistory.length > 0 ? supplierSalesHistory : salesHistory;
    activeSupplierSales.forEach((sale) => {
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

        if (supplierSalesHistory.length === 0 && source.includes('farm')) return;

        const isDahi =
          name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt') || cat.includes('yogurt');

        if (isDahi) {
          target.supplierDahiSalesQty += qty;
          target.supplierDahiSalesRev += sub;
        } else {
          target.supplierMilkSalesQty += qty;
          target.supplierMilkSalesRev += sub;
        }
        target.supplierTotalSalesRev += sub;
        target.saleItems.push({
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
      const d = parseCleanDate(exp.date || exp.createdAt);
      if (!d || !isMatchingTimeframe(d, dateFilter, startDate, endDate)) return;
      const target = initDate(d);
      if (!target) return;
      const amt = Number(exp.amount) || 0;
      target.supplierExpensesTotal += amt;
      target.expenseItems.push(exp);
    });

    // Compute Net Profit for each date
    Object.values(dates).forEach((day) => {
      day.supplierNetProfit = day.supplierTotalSalesRev - day.totalCost - day.supplierExpensesTotal;
    });

    return Object.values(dates).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [intakeLogs, supplierSalesHistory, salesHistory, expenses, dateFilter, startDate, endDate]);

  // Overall totals across the aggregated view
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalIntake += Number(day.supplierIntake) || 0;
        acc.totalCost += Number(day.totalCost) || 0;
        acc.totalPaid += Number(day.paidAmount) || 0;
        acc.totalPending += Number(day.pendingAmount) || 0;
        acc.totalMilkSalesQty += Number(day.supplierMilkSalesQty) || 0;
        acc.totalDahiSalesQty += Number(day.supplierDahiSalesQty) || 0;
        acc.totalSalesRev += Number(day.supplierTotalSalesRev) || 0;
        acc.totalExpenses += Number(day.supplierExpensesTotal) || 0;
        acc.totalNetProfit += Number(day.supplierNetProfit) || 0;
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

  const avgPurchaseRate =
    overallTotals.totalIntake > 0
      ? (overallTotals.totalCost / overallTotals.totalIntake).toFixed(1)
      : '240';
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
            <Truck className="w-4.5 h-4.5 text-blue-600" />
            Supplier Daily Milk &amp; Finance Report
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Procurement intakes, settlement liabilities, POS sales, and commercial margins
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
        theme="blue"
      />

      {/* 3. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-linear-to-br from-blue-50/80 via-sky-50/30 to-white border border-blue-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
            Total Milk Purchased
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-blue-700">
              {overallTotals.totalIntake.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Avg: Rs. {avgPurchaseRate} / L
          </span>
        </div>

        <div className="bg-linear-to-br from-rose-50/80 via-red-50/30 to-white border border-rose-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
            Purchase Cost
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-rose-700">
              Rs. {overallTotals.totalCost.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block font-medium">
            Paid: Rs. {overallTotals.totalPaid.toLocaleString()}
          </span>
        </div>

        <div className="bg-linear-to-br from-amber-50/80 via-yellow-50/30 to-white border border-amber-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Pending Supplier Dues
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-amber-700">
              Rs. {overallTotals.totalPending.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Payable settlements</span>
        </div>

        <div className="bg-linear-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Supplier Milk Sales
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-700">
              Rs. {overallTotals.totalSalesRev.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {overallTotals.totalMilkSalesQty.toFixed(1)} L sold in POS
          </span>
        </div>

        <div className="bg-linear-to-br from-indigo-50/80 via-purple-50/30 to-white border border-indigo-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
            Supplier Net Margin
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
          <span className="text-[10px] text-indigo-600 font-semibold mt-1 block font-mono">
            Commercial Margin: {overallMargin}%
          </span>
        </div>
      </div>

      {/* 4. Daily Breakdown Cards */}
      <div className="space-y-4">
        {aggregatedByDate.length > 0 ? (
          aggregatedByDate.map((day) => (
            <SupplierDailyReportDayCard key={day.date} day={day} />
          ))
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-400">
            <p className="text-sm font-medium">No supplier procurement records found for the selected timeframe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
