import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  Layers,
  Sparkles,
  ArrowUpRight,
  Receipt,
  Scale,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePOSContext } from '@/context/POSContext';
import { useExpense } from '@/context/ExpenseContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';

export default function TotalFinancialSummary() {
  const [period, setPeriod] = useState('all'); // 'all' | 'today' | 'this_month'

  const { farmSalesHistory = [], supplierSalesHistory = [], salesHistory = [] } = usePOSContext();
  const { expenses: farmExpensesList = [] } = useExpense();
  const { intakeLogs = [] } = useIntakeContext();
  const { expenses: supplierExpensesList = [] } = useSourcExpenseContext() || {};

  const todayStr = useMemo(() => {
    try {
      return new Date().toISOString().split('T')[0];
    } catch {
      return '';
    }
  }, []);
  const currentMonthStr = useMemo(() => (todayStr ? todayStr.slice(0, 7) : ''), [todayStr]);

  const parseISODate = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      return val.slice(0, 10);
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      try {
        return d.toISOString().split('T')[0];
      } catch {
        return '';
      }
    }
    return '';
  };

  const getSaleDate = (sale) => {
    if (!sale) return '';
    if (sale.timestamp) {
      const parsed = parseISODate(sale.timestamp);
      if (parsed) return parsed;
    }
    if (sale.date) {
      const parsed = parseISODate(sale.date);
      if (parsed) return parsed;
    }
    if (sale.createdAt) {
      const parsed = parseISODate(sale.createdAt);
      if (parsed) return parsed;
    }
    if (sale.formattedDate) {
      const parsed = parseISODate(sale.formattedDate);
      if (parsed) return parsed;
    }
    return '';
  };

  const isMatchingPeriod = (dateVal) => {
    if (period === 'all') return true;
    if (!dateVal) return true;
    const cleanDate = typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)
      ? dateVal.slice(0, 10)
      : parseISODate(dateVal);
    if (!cleanDate) return true;
    if (period === 'today') return cleanDate === todayStr;
    if (period === 'this_month') return cleanDate.startsWith(currentMonthStr);
    return true; // 'all'
  };

  // 1. FARM METRICS CALCULATION (Strictly Isolated)
  // Formula: (Farm Milk Sales + Farm Dahi Sales) - Farm Expenses = Farm Net Profit
  const farmFinancials = useMemo(() => {
    const activeFarmSales = farmSalesHistory.length > 0 ? farmSalesHistory : salesHistory;
    let milkSales = 0;
    let dahiSales = 0;
    let milkVolume = 0;
    let dahiVolume = 0;

    activeFarmSales.forEach((sale) => {
      const saleDate = getSaleDate(sale);

      if (!isMatchingPeriod(saleDate)) return;

      (sale.items || []).forEach((item) => {
        const src = item.source || '';
        // If not using pre-segregated history, verify source tag
        if (farmSalesHistory.length === 0 && src === 'Supplier') return;

        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price) || 0));

        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt') || cat.includes('yogurt');
        if (isDahi) {
          dahiSales += rev;
          dahiVolume += qty;
        } else {
          milkSales += rev;
          milkVolume += qty;
        }
      });
    });

    const totalSales = milkSales + dahiSales;

    // Farm Expenses
    let totalExpenses = 0;
    farmExpensesList.forEach((exp) => {
      const expDate = exp.date || '';
      if (isMatchingPeriod(expDate)) {
        totalExpenses += Number(exp.amount) || 0;
      }
    });

    const netProfit = totalSales - totalExpenses;
    const margin = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;

    return {
      milkSales,
      dahiSales,
      totalSales,
      totalExpenses,
      netProfit,
      margin,
      milkVolume,
      dahiVolume,
    };
  }, [farmSalesHistory, salesHistory, farmExpensesList, period, todayStr, currentMonthStr]);

  // 2. SUPPLIER METRICS CALCULATION (Strictly Isolated)
  // Formula: (Supplier Milk Sales + Supplier Dahi Sales) - Supplier Purchase Cost - Supplier Expenses = Supplier Net Profit
  const supplierFinancials = useMemo(() => {
    const activeSupplierSales = supplierSalesHistory.length > 0 ? supplierSalesHistory : salesHistory;
    let milkSales = 0;
    let dahiSales = 0;
    let milkVolume = 0;
    let dahiVolume = 0;

    activeSupplierSales.forEach((sale) => {
      const saleDate = getSaleDate(sale);

      if (!isMatchingPeriod(saleDate)) return;

      (sale.items || []).forEach((item) => {
        const src = item.source || '';
        // If not using pre-segregated history, verify source tag
        if (supplierSalesHistory.length === 0 && src === 'Farm') return;

        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price) || 0));

        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt') || cat.includes('yogurt');
        if (isDahi) {
          dahiSales += rev;
          dahiVolume += qty;
        } else {
          milkSales += rev;
          milkVolume += qty;
        }
      });
    });

    const totalSales = milkSales + dahiSales;

    // Supplier Purchase Cost
    let purchaseCost = 0;
    intakeLogs.forEach((log) => {
      const logDate = log.date || '';
      if (isMatchingPeriod(logDate)) {
        purchaseCost += Number(log.totalCost) || 0;
      }
    });

    // Supplier Overhead Expenses
    let totalExpenses = 0;
    supplierExpensesList.forEach((exp) => {
      const expDate = exp.date || '';
      if (isMatchingPeriod(expDate)) {
        totalExpenses += Number(exp.amount) || 0;
      }
    });

    const netProfit = totalSales - purchaseCost - totalExpenses;
    const margin = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;

    return {
      milkSales,
      dahiSales,
      totalSales,
      purchaseCost,
      totalExpenses,
      netProfit,
      margin,
      milkVolume,
      dahiVolume,
    };
  }, [supplierSalesHistory, salesHistory, intakeLogs, supplierExpensesList, period, todayStr, currentMonthStr]);

  // 3. TOTAL AGGREGATED BUSINESS FINANCIAL SUMMARY
  // Formula: Total Business Net Profit = Farm Net Profit + Supplier Net Profit
  const totalBusinessNetProfit = farmFinancials.netProfit + supplierFinancials.netProfit;
  const totalBusinessRevenue = farmFinancials.totalSales + supplierFinancials.totalSales;
  const totalBusinessOutflow = farmFinancials.totalExpenses + supplierFinancials.purchaseCost + supplierFinancials.totalExpenses;
  const totalBusinessMargin = totalBusinessRevenue > 0 ? Math.round((totalBusinessNetProfit / totalBusinessRevenue) * 100) : 0;
  const isBusinessProfitable = totalBusinessNetProfit >= 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header with Title and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-2xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 font-display tracking-tight">
                Total Financial Summary &amp; Profit Aggregation
              </h2>
              <p className="text-xs text-slate-500">
                Consolidated P&amp;L: Farm Net Profit + Supplier Net Profit
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-full shadow-2xs self-start sm:self-auto text-xs">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'this_month', label: 'This Month' },
            { id: 'today', label: 'Today' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1 font-bold rounded-full transition-all cursor-pointer ${
                period === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Aggregation Banner: Total Business Net Profit */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isBusinessProfitable
          ? 'bg-linear-to-r from-emerald-50/80 via-teal-50/50 to-indigo-50/40 border-emerald-200'
          : 'bg-rose-50/70 border-rose-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isBusinessProfitable
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {isBusinessProfitable ? 'Profitable Operations' : 'Net Business Deficit'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Consolidated Bottom-Line
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-600">Total Business Net Profit</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className={`text-3xl sm:text-4xl font-black font-display tracking-tight tabular ${
                isBusinessProfitable ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {totalBusinessNetProfit >= 0 ? '+' : '-'} Rs. {Math.abs(totalBusinessNetProfit).toLocaleString()}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                isBusinessProfitable ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
                {totalBusinessMargin}% Margin
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Formula: Farm Net Profit (Rs. {farmFinancials.netProfit.toLocaleString()}) + Supplier Net Profit (Rs. {supplierFinancials.netProfit.toLocaleString()})
            </p>
          </div>

          {/* Quick Metrics Tiles */}
          <div className="grid grid-cols-2 gap-2.5 sm:w-auto w-full">
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Business Inflow</p>
              <p className="text-base font-black text-slate-900 tabular mt-0.5">
                Rs. {totalBusinessRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">POS Milk + Dahi Sales</p>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Outflow &amp; Costs</p>
              <p className="text-base font-black text-slate-900 tabular mt-0.5">
                Rs. {totalBusinessOutflow.toLocaleString()}
              </p>
              <p className="text-[10px] text-rose-600 font-medium">Purchases + Expenses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Module Breakdowns (Strict Isolation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Module A: Farm P&L Card */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Farm Module Breakdown</h3>
                  <p className="text-[10px] text-slate-500">In-house animals yield &amp; farm-set Dahi</p>
                </div>
              </div>
              <Link
                to="/farm/reports"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                View P&amp;L <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Farm Net Profit Banner */}
            <div className="mt-3.5 p-3 bg-white rounded-xl border border-emerald-200/70 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Farm Net Profit</p>
                <p className={`text-xl font-black font-display tabular ${
                  farmFinancials.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {farmFinancials.netProfit >= 0 ? '+' : '-'} Rs. {Math.abs(farmFinancials.netProfit).toLocaleString()}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                farmFinancials.netProfit >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {farmFinancials.margin}% Margin
              </span>
            </div>

            {/* Farm Detailed Breakdown Lines */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-emerald-100/60">
                <span className="text-slate-600 font-medium">Farm Milk Sales (POS)</span>
                <span className="font-bold text-slate-900 tabular">
                  + Rs. {farmFinancials.milkSales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-emerald-100/60">
                <span className="text-slate-600 font-medium">Farm Dahi Sales (incl. Mixed Share)</span>
                <span className="font-bold text-slate-900 tabular">
                  + Rs. {farmFinancials.dahiSales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-emerald-100/60">
                <span className="text-slate-600 font-medium">Farm Operating Expenses (Feed, Labor, Vet)</span>
                <span className="font-bold text-rose-600 tabular">
                  - Rs. {farmFinancials.totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono pt-2 border-t border-emerald-100/50">
            Formula: (Farm Milk + Farm Dahi) - Farm Expenses
          </p>
        </div>

        {/* Module B: Supplier P&L Card */}
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/20 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Supplier Module Breakdown</h3>
                  <p className="text-[10px] text-slate-500">Procured milk sales &amp; supplier Dahi</p>
                </div>
              </div>
              <Link
                to="/supplier/pl"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors"
              >
                View P&amp;L <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Supplier Net Profit Banner */}
            <div className="mt-3.5 p-3 bg-white rounded-xl border border-blue-200/70 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Supplier Net Profit</p>
                <p className={`text-xl font-black font-display tabular ${
                  supplierFinancials.netProfit >= 0 ? 'text-blue-700' : 'text-rose-700'
                }`}>
                  {supplierFinancials.netProfit >= 0 ? '+' : '-'} Rs. {Math.abs(supplierFinancials.netProfit).toLocaleString()}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                supplierFinancials.netProfit >= 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {supplierFinancials.margin}% Margin
              </span>
            </div>

            {/* Supplier Detailed Breakdown Lines */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60">
                <span className="text-slate-600 font-medium">Supplier Milk Sales (POS)</span>
                <span className="font-bold text-slate-900 tabular">
                  + Rs. {supplierFinancials.milkSales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60">
                <span className="text-slate-600 font-medium">Supplier Dahi Sales (incl. Mixed Share)</span>
                <span className="font-bold text-slate-900 tabular">
                  + Rs. {supplierFinancials.dahiSales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60">
                <span className="text-slate-600 font-medium">Supplier Milk Purchase Cost</span>
                <span className="font-bold text-rose-600 tabular">
                  - Rs. {supplierFinancials.purchaseCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60">
                <span className="text-slate-600 font-medium">Supplier Sourcing Expenses</span>
                <span className="font-bold text-amber-700 tabular">
                  - Rs. {supplierFinancials.totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono pt-2 border-t border-blue-100/50">
            Formula: (Supplier Milk + Supplier Dahi) - Purchase Cost - Expenses
          </p>
        </div>
      </div>
    </div>
  );
}
