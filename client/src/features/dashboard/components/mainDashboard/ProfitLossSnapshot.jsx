import React, { useState, useMemo } from 'react';
import {TrendingUp,TrendingDown,DollarSign,Wallet,Store,Beef,AlertTriangle,ArrowUpRight,ArrowDownRight,} from "lucide-react";
import { usePOSContext } from "@/context/POSContext";
import { useExpense } from "@/context/ExpenseContext";
import { useIntakeContext } from "@/context/IntakeContext";
import { useCustomerContext } from "@/context/CustomerContext";
import { useAnimalContext } from "@/context/AnimalContext";
import { Link } from "react-router-dom";

import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { useDahiContext } from '@/context/DahiContext';
import { getPktTodayString, getPktDaysAgoString } from '@/utils/dateUtils';

export default function ProfitLossSnapshot() {
  const [timeRange, setTimeRange] = useState("today"); // 'today' | 'week' | 'month'

  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext();
  const { expenses: farmExpensesList = [], totals: expenseTotals = {} } = useExpense();
  const { intakeLogs = [], totals: intakeTotals = {} } = useIntakeContext();
  const { expenses: supplierExpensesList = [] } = useSourcExpenseContext() || {};
  const { batches: processingBatches = [] } = useDahiContext() || {};
  const { totalKhataReceivable = 0 } = useCustomerContext();

  const todayStr = useMemo(() => getPktTodayString(), []);
  const weekStartStr = useMemo(() => getPktDaysAgoString(7), []);
  const monthStartStr = useMemo(() => getPktDaysAgoString(30), []);

  const parseCleanDate = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      return val.slice(0, 10);
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const isMatchingTimeframe = (dateVal) => {
    const cleanDate = parseCleanDate(dateVal);
    if (!cleanDate) return true;

    if (timeRange === 'today') {
      return cleanDate === todayStr;
    }
    if (timeRange === 'week') {
      return cleanDate >= weekStartStr;
    }
    if (timeRange === 'month') {
      return cleanDate >= monthStartStr;
    }
    return true;
  };

  // Filtered Income & Expense Calculations
  const filteredSales = salesHistory.filter((s) => isMatchingTimeframe(s.timestamp || s.date || s.createdAt || s.formattedDate));
  const activeSalesList = (timeRange === 'today' && filteredSales.length === 0) ? salesHistory : filteredSales;
  const totalIncome = Math.round(activeSalesList.reduce((sum, s) => sum + (Number(s.netPayable) || Number(s.subtotal) || 0), 0));

  const filteredIntakes = intakeLogs.filter((log) => isMatchingTimeframe(log.date));
  const activeIntakesList = (timeRange === 'today' && filteredIntakes.length === 0) ? intakeLogs : filteredIntakes;
  const totalProcurement = Math.round(activeIntakesList.reduce((sum, log) => sum + (Number(log.totalCost || log.totalAmount) || 0), 0));

  const filteredFarmExp = farmExpensesList.filter((exp) => isMatchingTimeframe(exp.date));
  const activeFarmExpList = (timeRange === 'today' && filteredFarmExp.length === 0) ? farmExpensesList : filteredFarmExp;
  const totalFarmExp = Math.round(activeFarmExpList.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0));

  const filteredShopExp = supplierExpensesList.filter((exp) => isMatchingTimeframe(exp.date));
  const activeShopExpList = (timeRange === 'today' && filteredShopExp.length === 0) ? supplierExpensesList : filteredShopExp;
  const totalShopExp = Math.round(activeShopExpList.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0));

  let totalDahiDeltaCost = 0;
  processingBatches.forEach((b) => {
    if (!isMatchingTimeframe(b.date)) return;
    const pName = (b.product || '').toLowerCase();
    if (pName.includes('dahi') || pName.includes('yogurt') || !pName.includes('milk')) {
      const totCost = Number(b.totalDahiCost || b.dahiProductionCost) || 0;
      const milkTrans = Number(b.milkCostTransferred || b.milkUsedCost) || 0;
      totalDahiDeltaCost += Math.max(0, totCost - milkTrans);
    }
  });

  const totalExpense = Math.round(totalProcurement + totalFarmExp + totalShopExp + totalDahiDeltaCost);

  const netProfit = totalIncome - totalExpense;
  const marginPercent =
    totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
  const isPositive = netProfit >= 0;

  // Milk Discrepancy / Variance Calculation
  const totalFarmMilk = Number(inventoryMetrics.totalFarmYield) || 0;
  const totalProcured =
    intakeTotals.totalProcuredVolume !== undefined
      ? Number(intakeTotals.totalProcuredVolume)
      : 0;
  const totalMilkIn = totalFarmMilk + totalProcured;
  const totalMilkSold = parseFloat(inventoryMetrics.milkSold) || 0;
  const totalDahiMilk = Math.round(
    (parseFloat(inventoryMetrics.dahiSold) || 0) * 1.1,
  );
  const totalMilkOut = totalMilkSold + totalDahiMilk;
  const expectedClosing = Math.max(0, totalMilkIn - totalMilkOut);
  const actualClosing =
    parseFloat(inventoryMetrics.totalMilk) || expectedClosing;
  const milkVariance = parseFloat((actualClosing - expectedClosing).toFixed(1));

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* 1. Top Section Header with Time Range Switcher */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Profit &amp; Loss Financial Snapshot</span>
          </h3>
          
        </div>

        {/* Time Tabs */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-full shadow-2xs self-start sm:self-auto">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTimeRange(tab.id)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                timeRange === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary 3-Metric Summary Bar (Income, Expense, Net Profit) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Total Income */}
        <button
          className="p-5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/70 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600 block tracking-wider transition-colors">
              Total Revenue / Income
            </span>
            <span className="text-2xl font-black text-slate-900 font-display tabular">
              Rs. {totalIncome.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Direct sales &amp; khata inflows
            </span>
          </div>
        </button>

        {/* Total Expenses */}
        <Link
          to="/farm/expenses"
          className="p-5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/70 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600 block tracking-wider transition-colors">
              Total Operating Expenses
            </span>
            <span className="text-2xl font-black text-slate-900 font-display tabular">
              Rs. {totalExpense.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
              <ArrowDownRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              Operational expenses &amp; store costs
            </span>
          </div>
        </Link>

        {/* Net Profit */}
        <Link
          to="/farm/pl"
          className={`p-5 rounded-2xl flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none ${
            isPositive
              ? "bg-emerald-50/80 text-emerald-950 hover:bg-emerald-50"
              : "bg-rose-50/80 text-rose-950 hover:bg-rose-50"
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Net Bottom-Line Profit
            </span>
            <span
              className={`text-2xl font-black font-display tabular ${
                isPositive ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isPositive ? "+" : "-"} Rs.{" "}
              {Math.abs(netProfit).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
              Estimated margin:{" "}
              <strong
                className={isPositive ? "text-emerald-700" : "text-rose-700"}
              >
                {marginPercent}%
              </strong>
            </span>
          </div>
          
        </Link>
      </div>

      {/* 3. 4 Additional Cards (Receivables, Supplier Expenses, Farm Expenses, Milk Variance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Card 1: Receivables */}
        <Link
          to="/customer-khata-ledger"
          className="p-4 rounded-2xl bg-slate-50/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Receivables
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 font-display tabular">
            Rs. {totalKhataReceivable.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
            Customer Khata ledger pending &rarr;
          </p>
        </Link>

        {/* Card 2: Supplier Expenses */}
        <Link
          to="/supplier/expenses"
          className="p-4 rounded-2xl bg-slate-50/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Supplier Expenses
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 font-display tabular">
            Rs. {totalShopExp.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Utilities, &amp; logistics &rarr;
          </p>
        </Link>

        {/* Card 3: Farm Expenses */}
        <Link
          to="/farm/expenses"
          className="p-4 rounded-2xl bg-slate-50/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Farm Expenses
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Beef className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 font-display tabular">
            Rs. {totalFarmExp.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Silage feed, vet &amp; cattle upkeep &rarr;
          </p>
        </Link>

        {/* Card 4: Milk Variance */}
        <Link
          to="/finance/daily-closing"
          className="p-4 rounded-2xl bg-slate-50/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Milk Variance
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p
            className={`text-lg font-black font-display tabular ${
              milkVariance === 0
                ? "text-emerald-700"
                : milkVariance > 0
                  ? "text-blue-700"
                  : "text-amber-600"
            }`}
          >
            {milkVariance > 0 ? `+${milkVariance}` : milkVariance} L
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Inflow vs outflow reconciliation &rarr;
          </p>
        </Link>
      </div>
    </div>
  );
}
