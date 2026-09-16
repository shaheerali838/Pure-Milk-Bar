import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  Layers,
  Sparkles,
  Receipt,
  Minus,
  Equal,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ProfitLossSummary({
  incomeData = {},
  directCostsData = {},
  runningExpensesData = {},
}) {
  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  // Simple, clean variables
  const milkSales = Number(incomeData.milkSales) || 0;
  const dairyProducts = Number(incomeData.dairyProducts) || 0;
  const totalFarmIncome = milkSales + dairyProducts;

  // Direct Production Costs (Feed & Packing)
  const charaFodder = Number(directCostsData.charaFodder) || 0;
  const wandaSilage = Number(directCostsData.wandaSilage) || 0;
  const packagingCosts = Number(directCostsData.packagingCosts) || 0;
  const totalDirectCosts = charaFodder + wandaSilage + packagingCosts;

  // Subtotal Line: Gross Profit
  const grossProfit = totalFarmIncome - totalDirectCosts;

  // Farm Running Expenses (Labor, Vet & Bills)
  const veterinary = Number(runningExpensesData.veterinary) || 0;
  const laborWages = Number(runningExpensesData.laborWages) || 0;
  const electricity = Number(runningExpensesData.electricity) || 0;
  const maintenance = Number(runningExpensesData.maintenance) || 0;
  const transport = Number(runningExpensesData.transport) || 0;
  const totalRunningExpenses = veterinary + laborWages + electricity + maintenance + transport;

  // Final Result Line: Total Net Profit (Take-Home Earnings)
  const totalNetProfit = grossProfit - totalRunningExpenses;
  const netMargin = totalFarmIncome > 0 ? ((totalNetProfit / totalFarmIncome) * 100).toFixed(1) : '0.0';

  const isProfitable = totalNetProfit >= 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Farm Profit &amp; Loss Summary
          </h2>
          
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isProfitable
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {isProfitable ? `Net Margin: ${netMargin}%` : `Operating Loss (${netMargin}%)`}
          </span>
        </div>
      </div>

      {/* Step-by-Step Breakdown Container */}
      <div className="space-y-4">
        {/* ==================================================================== */}
        {/* 1. TOTAL FARM INCOME (MONEY IN) */}
        {/* ==================================================================== */}
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                +
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Total Farm Income (Money In)
                </h3>
              </div>
            </div>
            <p className="text-lg font-black text-emerald-700 tabular">
              {fmt(totalFarmIncome)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/50 text-xs">
            <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Droplets className="w-3 h-3 text-blue-600" /> Milk Sales (Cow &amp; Buffalo)
              </span>
              <span className="font-bold text-slate-900 tabular">{fmt(milkSales)}</span>
            </div>

            <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Layers className="w-3 h-3 text-teal-600" /> Value-Added Products (Farm-Set Dahi)
              </span>
              <span className="font-bold text-slate-900 tabular">{fmt(dairyProducts)}</span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. DIRECT PRODUCTION COSTS (FEED & PACKING) */}
        {/* ==================================================================== */}
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                -
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Direct Production Costs (Feed &amp; Packing)
                </h3>
              </div>
            </div>
            <p className="text-lg font-black text-amber-700 tabular">
              - {fmt(totalDirectCosts)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/50 text-xs">
            <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-slate-600 font-medium">Green Chara / Fodder</span>
              <span className="font-bold text-amber-700 tabular">- {fmt(charaFodder)}</span>
            </div>

            <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-slate-600 font-medium">Silage, Wanda &amp; Khal</span>
              <span className="font-bold text-amber-700 tabular">- {fmt(wandaSilage)}</span>
            </div>

            <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-slate-600 font-medium">Packaging Pots &amp; Seal</span>
              <span className="font-bold text-amber-700 tabular">- {fmt(packagingCosts)}</span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3. SUBTOTAL LINE: GROSS PROFIT */}
        {/* ==================================================================== */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-xs">
              =
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Gross Profit
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-emerald-400 tabular">
              {fmt(grossProfit)}
            </p>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 4. FARM RUNNING EXPENSES (LABOR, VET & BILLS) */}
        {/* ==================================================================== */}
        <div className="rounded-2xl border border-rose-200/70 bg-rose-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                -
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Farm Running Expenses (Labor, Vet &amp; Bills)
                </h3>
              </div>
            </div>
            <p className="text-lg font-black text-rose-700 tabular">
              - {fmt(totalRunningExpenses)}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-rose-200/50 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
              <p className="text-[10px] text-slate-400 font-medium">Veterinary &amp; Med</p>
              <p className="font-bold text-rose-700 tabular mt-0.5">- {fmt(veterinary)}</p>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
              <p className="text-[10px] text-slate-400 font-medium">Labor &amp; Mess</p>
              <p className="font-bold text-rose-700 tabular mt-0.5">- {fmt(laborWages)}</p>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
              <p className="text-[10px] text-slate-400 font-medium">Electricity &amp; Power</p>
              <p className="font-bold text-rose-700 tabular mt-0.5">- {fmt(electricity)}</p>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
              <p className="text-[10px] text-slate-400 font-medium">Shed &amp; Repairs</p>
              <p className="font-bold text-rose-700 tabular mt-0.5">- {fmt(maintenance)}</p>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
              <p className="text-[10px] text-slate-400 font-medium">Fuel &amp; Transport</p>
              <p className="font-bold text-rose-700 tabular mt-0.5">- {fmt(transport)}</p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 5. FINAL RESULT LINE: TOTAL NET PROFIT (TAKE-HOME EARNINGS) */}
        {/* ==================================================================== */}
        <div className={`p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isProfitable
            ? 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900'
            : 'bg-gradient-to-r from-rose-700 to-red-900'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Total Net Profit (Take-Home Earnings)
              </h3>
            </div>
            <p className="text-xs text-indigo-100/80">
              Final realized net surplus after all direct feed, packaging &amp; farm running overheads
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 tabular">
              {fmt(totalNetProfit)}
            </p>
            <div className="flex items-center justify-end gap-2 mt-0.5">
              <span className="text-xs text-slate-200">Net Margin:</span>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white/20 text-white tabular">
                {netMargin}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
