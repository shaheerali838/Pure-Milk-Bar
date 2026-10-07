import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Droplets,
  Layers,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePOSContext } from '@/context/POSContext';
import { useExpense } from '@/context/ExpenseContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { useDahiContext } from '@/context/DahiContext';
import { useStaffContext } from '@/context/StaffContext';

import { getPktTodayString } from '@/utils/dateUtils';

export default function TotalFinancialSummary() {
  const [period, setPeriod] = useState('today'); // 'today' (default) | 'this_month' | 'all'

  const { farmSalesHistory = [], supplierSalesHistory = [], inventoryMetrics = {} } = usePOSContext();
  const availableFarmStock = Number(inventoryMetrics.rawFarmMilkStock ?? inventoryMetrics.rawAvailableFarmStock ?? 0) || 0;
  const availableSupplierStock = Number(inventoryMetrics.rawSupplierMilkStock ?? 0) || 0;
  const { expenses: farmExpensesList = [] } = useExpense();
  const { intakeLogs = [] } = useIntakeContext();
  const { expenses: supplierExpensesList = [] } = useSourcExpenseContext() || {};
  const { batches: processingBatches = [] } = useDahiContext() || {};
  const { salaryPayments = [] } = useStaffContext();

  const todayStr = useMemo(() => {
    try {
      return getPktTodayString();
    } catch {
      return new Date().toISOString().split('T')[0];
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
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
    if (!dateVal) return false;
    const cleanDate = typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)
      ? dateVal.slice(0, 10)
      : parseISODate(dateVal);
    if (!cleanDate) return false;
    if (period === 'today') return cleanDate === todayStr || cleanDate === new Date().toISOString().split('T')[0];
    if (period === 'this_month') return cleanDate.startsWith(currentMonthStr);
    return true; // 'all'
  };

  // Client rule: Farm milk/dahi has NO cost price, and supplier milk cost is fully
  // captured via procurement (intake logs). No hardcoded dahi processing costs.

  // 1. FARM METRICS CALCULATION
  const farmFinancials = useMemo(() => {
    const activeFarmSales = farmSalesHistory;
    let milkSales = 0;
    let dahiSales = 0;
    let milkQty = 0;
    let dahiQty = 0;

    activeFarmSales.forEach((sale) => {
      const saleDate = getSaleDate(sale);
      if (!isMatchingPeriod(saleDate)) return;

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price) || 0));

        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt');
        if (isDahi) {
          dahiSales += rev;
          dahiQty += qty;
        } else {
          milkSales += rev;
          milkQty += qty;
        }
      });
    });

    const totalSales = milkSales + dahiSales;

    let staffSalaryPaid = 0;
    salaryPayments.forEach((p) => {
      if (isMatchingPeriod(p.date || '')) {
        staffSalaryPaid += Number(p.amount) || 0;
      }
    });

    let generalFarmExpenses = 0;
    farmExpensesList.forEach((exp) => {
      if (isMatchingPeriod(exp.date || '')) {
        const c = (exp.category || '').toLowerCase();
        if (!c.includes('salar') && !c.includes('wage')) {
          generalFarmExpenses += Number(exp.amount) || 0;
        }
      }
    });

    // Total Farm Expenses = General Farm Expenses (Chara etc.) + Staff Salary Paid (No milk/dahi cost)
    const totalFarmExpenses = generalFarmExpenses + staffSalaryPaid;
    // farmNetProfit = farmRawMilkRevenue + Farm Dahi Revenue - Total Farm Expenses
    const netProfit = totalSales - totalFarmExpenses;
    const margin = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;

    return { milkSales, milkQty, dahiSales, dahiQty, totalSales, totalExpenses: generalFarmExpenses, staffSalaryPaid, totalFarmExpenses, netProfit, margin };
  }, [farmSalesHistory, farmExpensesList, salaryPayments, period, todayStr, currentMonthStr]);

  // 2. SUPPLIER METRICS CALCULATION
  const supplierFinancials = useMemo(() => {
    const activeSupplierSales = supplierSalesHistory;
    let milkSales = 0;
    let dahiSales = 0;
    let milkQty = 0;
    let dahiQty = 0;

    activeSupplierSales.forEach((sale) => {
      const saleDate = getSaleDate(sale);
      if (!isMatchingPeriod(saleDate)) return;

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price) || 0));

        const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt');
        if (isDahi) {
          dahiSales += rev;
          dahiQty += qty;
        } else {
          milkSales += rev;
          milkQty += qty;
        }
      });
    });

    const totalSales = milkSales + dahiSales;

    let purchaseCost = 0;
    let purchaseQty = 0;
    intakeLogs.forEach((log) => {
      if (isMatchingPeriod(log.date || log.createdAt || '')) {
        const qty = Number(log.quantity || log.quantityLiters) || 0;
        const explicit = Number(log.totalCost ?? log.totalAmount) || 0;
        const rate = Number(log.ratePerLiter ?? log.rate ?? log.pricePerLiter) || 0;
        // Procurement = Intake Qty * Procurement Price
        purchaseCost += explicit > 0 ? explicit : qty * rate;
        purchaseQty += qty;
      }
    });

    let totalExpenses = 0;
    supplierExpensesList.forEach((exp) => {
      if (isMatchingPeriod(exp.date || '')) {
        totalExpenses += Number(exp.amount) || 0;
      }
    });

    // supplierNetProfit = supplierRevenue - (Intake Qty * Procurement Price) - recorded supplier expenses
    const netProfit = totalSales - purchaseCost - totalExpenses;
    const margin = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;

    return { milkSales, milkQty, dahiSales, dahiQty, totalSales, purchaseCost, purchaseQty, totalExpenses, netProfit, margin };
  }, [supplierSalesHistory, intakeLogs, supplierExpensesList, period, todayStr, currentMonthStr]);

  // 3. DAHI METRICS CALCULATION (Revenue split only - no hardcoded cost)
  const dahiFinancials = useMemo(() => {
    const farmDahiSales = farmFinancials.dahiSales;
    const supplierDahiSales = supplierFinancials.dahiSales;
    const totalDahiSales = farmDahiSales + supplierDahiSales;
    const totalDahiQty = farmFinancials.dahiQty + supplierFinancials.dahiQty;
    return { farmDahiSales, supplierDahiSales, totalDahiSales, totalDahiQty };
  }, [farmFinancials, supplierFinancials]);

  // 4. TOTAL BUSINESS SUMMARY (Farm + Supplier aggregation)
  const totalMilkSoldQty = Number((farmFinancials.milkQty + supplierFinancials.milkQty).toFixed(2));
  const totalMilkSalesRevenue = farmFinancials.milkSales + supplierFinancials.milkSales;
  const totalBusinessNetProfit = farmFinancials.netProfit + supplierFinancials.netProfit;
  const totalBusinessRevenue = farmFinancials.totalSales + supplierFinancials.totalSales;
  const isBusinessProfitable = totalBusinessNetProfit >= 0;
  const periodLabel = period === 'today' ? 'Today' : period === 'this_month' ? 'This Month' : 'All Time';
  const fmtQty = (n) => Number((Number(n) || 0).toFixed(1));

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
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
            </div>
          </div>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-full shadow-2xs self-start sm:self-auto text-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'this_month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
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
               <p className="text-xs font-semibold text-slate-600">Total Business Net Profit</p>

            </div>

            <div className="flex items-baseline gap-3 mt-1">
              <span className={`text-3xl sm:text-4xl font-black font-display tracking-tight tabular ${
                isBusinessProfitable ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {totalBusinessNetProfit >= 0 ? 'Profit' : 'loss'} Rs. {Math.abs(totalBusinessNetProfit).toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Formula: Farm Net Profit (Rs. {farmFinancials.netProfit.toLocaleString()}) + Supplier Net Profit (Rs. {supplierFinancials.netProfit.toLocaleString()})
            </p>
          </div>

          <div className="sm:w-auto w-full">
            <div className="bg-white/90 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Business Sales Revenue</p>
              <p className="text-xl font-black text-slate-900 tabular mt-0.5">
                Rs. {totalBusinessRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">POS Milk + Dahi Sales (Money In)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Milk Summary Cards (Farm + Supplier) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Milk Sold ({periodLabel})</p>
          <p className="text-xl font-black text-slate-900 tabular mt-0.5">{fmtQty(totalMilkSoldQty)} L</p>
          <p className="text-[10px] text-slate-500 font-medium">Farm {fmtQty(farmFinancials.milkQty)} L + Supplier {fmtQty(supplierFinancials.milkQty)} L</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Milk Sales Revenue</p>
          <p className="text-xl font-black text-emerald-700 tabular mt-0.5">+ Rs. {totalMilkSalesRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 font-medium">Farm Rs. {farmFinancials.milkSales.toLocaleString()} + Supplier Rs. {supplierFinancials.milkSales.toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Business Net Profit</p>
          <p className={`text-xl font-black tabular mt-0.5 ${isBusinessProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isBusinessProfitable ? '+' : '-'} Rs. {Math.abs(totalBusinessNetProfit).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">Farm Net + Supplier Net</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Module A: Farm P&L Card */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Farm Breakdown</h3>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200/70 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Net Profit</p>
                <p className={`text-lg font-black font-display tabular ${
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

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-emerald-100/60">
                <span className="text-slate-600 font-medium">Farm Milk Sales: <span className="font-bold text-slate-800 tabular">{Number(farmFinancials.milkQty.toFixed(1))} L</span></span>
                <span className="font-bold text-slate-900 tabular">👉 + Rs. {farmFinancials.milkSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-emerald-100/60">
                <span className="text-slate-600 font-medium">Farm Dahi Sales: <span className="font-bold text-slate-800 tabular">{Number(farmFinancials.dahiQty.toFixed(1))} Kg</span></span>
                <span className="font-bold text-slate-900 tabular">👉 + Rs. {farmFinancials.dahiSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-emerald-100/60 font-semibold bg-emerald-50/50 px-1.5 rounded">
                <span className="text-emerald-900">Total Farm Sales (Money In)</span>
                <span className="font-bold text-emerald-800 tabular">Rs. {farmFinancials.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-emerald-100/60">
                <span className="text-slate-600 font-medium">Farm Expenses (Chara etc.)</span>
                <span className="font-bold text-rose-600 tabular">👉 - Rs. {farmFinancials.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-emerald-100/60">
                <span className="text-slate-600 font-medium">Staff Salary Paid</span>
                <span className="font-bold text-rose-600 tabular">👉 - Rs. {farmFinancials.staffSalaryPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-1.5 rounded bg-white border border-emerald-200">
                <span className="text-emerald-900 font-semibold">Available Farm Stock</span>
                <span className="font-black text-emerald-700 tabular">{fmtQty(availableFarmStock)} L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module B: Supplier P&L Card */}
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/20 p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Supplier Breakdown</h3>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200/70 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Net Profit</p>
                <p className={`text-lg font-black font-display tabular ${
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

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60">
                <span className="text-slate-600 font-medium">Supplier Milk Sales: <span className="font-bold text-slate-800 tabular">{Number(supplierFinancials.milkQty.toFixed(1))} L</span></span>
                <span className="font-bold text-slate-900 tabular">👉 + Rs. {supplierFinancials.milkSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60">
                <span className="text-slate-600 font-medium">Supplier Dahi Sales: <span className="font-bold text-slate-800 tabular">{Number(supplierFinancials.dahiQty.toFixed(1))} Kg</span></span>
                <span className="font-bold text-slate-900 tabular">👉 + Rs. {supplierFinancials.dahiSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60">
                <span className="text-slate-600 font-medium">Milk Purchased: <span className="font-bold text-slate-800 tabular">{Number(supplierFinancials.purchaseQty.toFixed(1))} L</span></span>
                <span className="font-bold text-rose-600 tabular">👉 - Rs. {supplierFinancials.purchaseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60 font-semibold bg-blue-50/50 px-1.5 rounded">
                <span className="text-blue-900">Total Supplier Sales (Money In)</span>
                <span className="font-bold text-blue-800 tabular">Rs. {supplierFinancials.totalSales.toLocaleString()}</span>
              </div>
              {supplierFinancials.totalExpenses > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-blue-100/60">
                  <span className="text-slate-600 font-medium">Supplier Expenses</span>
                  <span className="font-bold text-rose-600 tabular">👉 - Rs. {supplierFinancials.totalExpenses.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1.5 px-1.5 rounded bg-white border border-blue-200">
                <span className="text-blue-900 font-semibold">Available Supplier Stock</span>
                <span className="font-black text-blue-700 tabular">{fmtQty(availableSupplierStock)} L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module C: Dahi Specific P&L Card */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/20 p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Dahi Sales Breakdown</h3>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-white rounded-xl border border-amber-200/70 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Dahi Revenue</p>
                <p className="text-lg font-black font-display tabular text-amber-700">
                  + Rs. {dahiFinancials.totalDahiSales.toLocaleString()}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                {fmtQty(dahiFinancials.totalDahiQty)} Kg
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-amber-100/60">
                <span className="text-slate-600 font-medium">Farm Dahi (no cost)</span>
                <span className="font-bold text-slate-900 tabular">+ Rs. {dahiFinancials.farmDahiSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-amber-100/60">
                <span className="text-slate-600 font-medium">Supplier Dahi</span>
                <span className="font-bold text-slate-900 tabular">+ Rs. {dahiFinancials.supplierDahiSales.toLocaleString()}</span>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>
    </div>
  );
}
