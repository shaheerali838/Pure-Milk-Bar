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
  Users,
} from 'lucide-react';

export default function ProfitLossSummary({
  incomeData = {},
  expenses = [],
  dahiData = null,
  totalStaffSalaryPaid = 0,
}) {
  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  // Simple, clean variables
  const milkSales = Number(incomeData.milkSales) || 0;
  const dairyProducts = Number(incomeData.dairyProducts) || 0;
  const totalFarmIncome = milkSales + dairyProducts;

  // Dynamically group actual user expenses
  const directCosts = [];
  const runningCosts = [];
  
  const expenseGroups = {};
  expenses.forEach(exp => {
      const cat = exp.category || 'Other / Miscellaneous';
      if (!expenseGroups[cat]) expenseGroups[cat] = 0;
      expenseGroups[cat] += (Number(exp.amount) || 0);
  });

  let totalDirectCosts = 0;
  let totalRunningExpenses = 0;

  Object.entries(expenseGroups).forEach(([name, amount]) => {
      if (amount <= 0) return;
      const nm = name.toLowerCase();
      // Classify as Direct Cost if it is feed, seed, or fodder related
      if (
        nm.includes('feed') || 
        nm.includes('fodder') || 
        nm.includes('seed') || 
        nm.includes('silage') || 
        nm.includes('wanda') || 
        nm.includes('crop')
      ) {
          directCosts.push({ name, amount });
          totalDirectCosts += amount;
      } else {
          runningCosts.push({ name, amount });
          totalRunningExpenses += amount;
      }
  });

  // Calculate staff salary addition if not already counted in expenses
  const hasSalaryInExpenses = Object.keys(expenseGroups).some(k => k.toLowerCase().includes('salary') || k.toLowerCase().includes('wage'));
  const effectiveSalaryDeduction = hasSalaryInExpenses ? 0 : totalStaffSalaryPaid;
  const totalAllFarmExpenses = totalDirectCosts + totalRunningExpenses + effectiveSalaryDeduction;

  // Subtotal Line: Gross Profit
  const grossProfit = totalFarmIncome - totalDirectCosts;

  // Final Result Line: Farm Net Profit (Take-Home Earnings)
  const totalNetProfit = totalFarmIncome - totalAllFarmExpenses;
  const netMargin = totalFarmIncome > 0 ? ((totalNetProfit / totalFarmIncome) * 100).toFixed(1) : '0.0';

  const isProfitable = totalNetProfit >= 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
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

      <div className="space-y-4">
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

        {dahiData && (
          <div className="rounded-2xl border border-blue-200/70 bg-blue-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Dahi Value-Add (Processing Analysis)
                  </h3>
                </div>
              </div>
              <p className={`text-lg font-black tabular ${dahiData.dahiNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {dahiData.dahiNetProfit >= 0 ? '+' : '-'} {fmt(Math.abs(dahiData.dahiNetProfit))}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-blue-200/50 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60 bg-white/40 px-2 rounded font-semibold">
                <span className="text-slate-700">Total Dahi Sales (Money In)</span>
                <span className="font-bold text-emerald-700 tabular">+ {fmt(dahiData.dahiSales)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Farm Operating Expenses (Money Out) */}
        <div className="rounded-2xl border border-rose-200/70 bg-rose-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                <Receipt className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Total Farm Operating Expenses (Money Out)
                </h3>
              </div>
            </div>
            <p className="text-lg font-black text-rose-700 tabular">
              - {fmt(totalDirectCosts + totalRunningExpenses)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-rose-200/50 text-xs">
            {Object.entries(expenseGroups).filter(([_, amt]) => amt > 0).length === 0 ? (
              <p className="text-slate-400 text-xs col-span-3 py-1">No farm operating expenses recorded for this period.</p>
            ) : (
              Object.entries(expenseGroups)
                .filter(([_, amt]) => amt > 0)
                .map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between items-center bg-white/80 p-2.5 rounded-xl border border-rose-100">
                    <span className="text-slate-600 font-medium truncate">{cat}</span>
                    <span className="font-bold text-rose-700 tabular ml-2">- {fmt(amt)}</span>
                  </div>
                ))
            )}
          </div>
        </div>

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
