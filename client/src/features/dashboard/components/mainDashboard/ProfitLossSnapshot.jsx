import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Store,
  Beef,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { useExpense } from '@/context/ExpenseContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { useAnimalContext } from '@/context/AnimalContext';
import { Link } from 'react-router-dom';

export default function ProfitLossSnapshot() {
  const [timeRange, setTimeRange] = useState('today'); // 'today' | 'week' | 'month'

  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext();
  const { totals: expenseTotals = {} } = useExpense();
  const { totals: intakeTotals = {} } = useIntakeContext();
  const { totalKhataReceivable = 0 } = useCustomerContext();
  const { animals = [] } = useAnimalContext();

  // Multipliers for timeframes
  const multiplier = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : 30;

  // Base daily income & expenses calculated dynamically:
  const baseDailySales = salesHistory.reduce(
    (sum, s) => sum + (Number(s.netPayable) || 0),
    0
  );

  const baseProcurementSpend = Number(intakeTotals.totalIntakeSpend) || 0;
  const baseFarmExpense = Number(expenseTotals.feedSeedFarming) || Number(expenseTotals.totalFarmExpense) || 0;
  const baseShopExpense =
    (Number(expenseTotals.fuelTransportRepairs) || 0) +
    (Number(expenseTotals.salariesKitchenMess) || 0);

  // Multiplied values according to active time range
  const totalIncome = Math.round(baseDailySales * multiplier);
  const totalProcurement = Math.round(baseProcurementSpend * multiplier);
  const totalFarmExp = Math.round(baseFarmExpense * multiplier);
  const totalShopExp = Math.round(baseShopExpense * multiplier);
  const totalExpense = totalProcurement + totalFarmExp + totalShopExp;

  const netProfit = totalIncome - totalExpense;
  const marginPercent = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
  const isPositive = netProfit >= 0;

  // Milk Discrepancy / Variance Calculation
  const totalFarmMilk = animals.reduce((s, a) => s + (parseFloat(a.totalDailyYield) || 0), 0);
  const totalProcured =
    intakeTotals.totalProcuredVolume !== undefined
      ? Number(intakeTotals.totalProcuredVolume)
      : 0;
  const totalMilkIn = totalFarmMilk + totalProcured;
  const totalMilkSold = parseFloat(inventoryMetrics.milkSold) || 0;
  const totalDahiMilk = Math.round((parseFloat(inventoryMetrics.dahiSold) || 0) * 1.1);
  const totalMilkOut = totalMilkSold + totalDahiMilk;
  const expectedClosing = Math.max(0, totalMilkIn - totalMilkOut);
  const actualClosing = parseFloat(inventoryMetrics.totalMilk) || expectedClosing;
  const milkVariance = parseFloat((actualClosing - expectedClosing).toFixed(1));

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
      {/* 1. Top Section Header with Time Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Profit &amp; Loss Financial Snapshot</span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time income, direct procurement, operational costs &amp; net profitability
          </p>
        </div>

        {/* Time Tabs */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 shadow-2xs self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTimeRange(tab.id)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                timeRange === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
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
        <Link
          to="/pos"
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-emerald-300 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group select-none"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600 block tracking-wider transition-colors">
              Total Revenue / Income
            </span>
            <span className="text-2xl font-black text-slate-900 font-display tabular">
              Rs. {totalIncome.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Direct sales &amp; khata inflows
            </span>
          </div>
        </Link>

        {/* Total Expenses */}
        <Link
          to="/farm/expenses"
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-rose-300 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group select-none"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600 block tracking-wider transition-colors">
              Total Operating Expenses
            </span>
            <span className="text-2xl font-black text-slate-900 font-display tabular">
              Rs. {totalExpense.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
              <ArrowDownRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              Procurement, feed &amp; store costs
            </span>
          </div>
        </Link>

        {/* Net Profit */}
        <Link
          to="/farm/pl"
          className={`p-4 rounded-xl border flex items-center justify-between hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group select-none ${
            isPositive
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:border-emerald-300'
              : 'bg-rose-50/80 border-rose-200 text-rose-950 hover:border-rose-300'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Net Bottom-Line Profit
            </span>
            <span
              className={`text-2xl font-black font-display tabular ${
                isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isPositive ? '+' : '-'} Rs. {Math.abs(netProfit).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
              Estimated margin: <strong className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>{marginPercent}%</strong>
            </span>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs group-hover:scale-105 transition-transform ${
              isPositive
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {marginPercent}%
          </div>
        </Link>
      </div>

      {/* 3. 4 Additional Cards (Receivables, Shop Expenses, Farm Expenses, Milk Variance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Card 1: Receivables */}
        <Link
          to="/customer-khata-ledger"
          className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Receivables
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
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

        {/* Card 2: Shop Expenses */}
        <Link
          to="/supplier/expenses"
          className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Shop Expenses
            </span>
            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 font-display tabular">
            Rs. {totalShopExp.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Utilities, shop staff &amp; logistics &rarr;
          </p>
        </Link>

        {/* Card 3: Farm Expenses */}
        <Link
          to="/farm/expenses"
          className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Farm Expenses
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
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
          className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group select-none block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Milk Variance
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p
            className={`text-lg font-black font-display tabular ${
              milkVariance === 0
                ? 'text-emerald-700'
                : milkVariance > 0
                ? 'text-blue-700'
                : 'text-amber-600'
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
