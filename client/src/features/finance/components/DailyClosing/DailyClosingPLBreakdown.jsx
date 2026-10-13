import React from 'react';
import {
  Tractor,
  Truck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  Receipt,
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function DailyClosingPLBreakdown({
  farmPL = {},
  supplierPL = {},
  totalBusinessProfit = 0,
  date = '',
  isClosed = false,
  compact = false,
}) {
  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-PK')}`;
  const formatL = (val) => `${Number(val || 0).toLocaleString('en-PK', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`;

  const farmMilkRevenue = Number(farmPL.milkRevenue || farmPL.farmMilkRevenue || 0);
  const farmDahiRevenue = Number(farmPL.dahiRevenue || farmPL.farmDahiRevenue || 0);
  const farmTotalRevenue = Number(farmPL.totalRevenue || (farmMilkRevenue + farmDahiRevenue));
  const farmTotalExpenses = Number(farmPL.totalExpenses || farmPL.expenses || 0);
  const farmNetProfit = Number(farmPL.netProfit ?? (farmTotalRevenue - farmTotalExpenses));

  const supplierPurchasedQty = Number(supplierPL.purchasedQty || supplierPL.quantityLiters || supplierPL.totalLiters || 0);
  const supplierTotalProcurementCost = Number(supplierPL.totalProcurementCost || supplierPL.procurementCost || supplierPL.totalCost || 0);
  const supplierAvgRate = supplierPurchasedQty > 0
    ? (supplierTotalProcurementCost / supplierPurchasedQty).toFixed(1)
    : (Number(supplierPL.avgRate || supplierPL.ratePerLiter || 0) || 0);
  const supplierMilkRevenue = Number(supplierPL.milkRevenue || supplierPL.supplierMilkRevenue || 0);
  const supplierDahiRevenue = Number(supplierPL.dahiRevenue || supplierPL.supplierDahiRevenue || 0);
  const supplierTotalRevenue = Number(supplierPL.totalRevenue || (supplierMilkRevenue + supplierDahiRevenue));
  const supplierTotalExpenses = Number(supplierPL.totalExpenses || supplierPL.expenses || 0);
  const supplierNetProfit = Number(supplierPL.netProfit ?? (supplierTotalRevenue - supplierTotalProcurementCost - supplierTotalExpenses));

  const finalBusinessProfit = Number(totalBusinessProfit ?? (farmNetProfit + supplierNetProfit));
  const isProfit = finalBusinessProfit > 0;
  const isLoss = finalBusinessProfit < 0;

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Farm & Supplier Side by Side mini */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* Farm P&L */}
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200 border-b border-emerald-200/60 pb-1">
              <span className="flex items-center gap-1.5">
                <Tractor className="w-3.5 h-3.5 text-emerald-600" /> Farm P&amp;L
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${farmNetProfit >= 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                {farmNetProfit >= 0 ? '+' : ''}{formatRs(farmNetProfit)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Farm Milk:</span>
              <span className="font-semibold">{formatRs(farmMilkRevenue)}</span>
            </div>
            {farmDahiRevenue > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Farm Dahi:</span>
                <span className="font-semibold">{formatRs(farmDahiRevenue)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
              <span>Total Revenue:</span>
              <span>{formatRs(farmTotalRevenue)}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
              <span>Farm Expenses:</span>
              <span>-{formatRs(farmTotalExpenses)}</span>
            </div>
          </div>

          {/* Supplier P&L */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200 border-b border-blue-200/60 pb-1">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Supplier P&amp;L
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${supplierNetProfit >= 0 ? 'bg-blue-200 text-blue-900' : 'bg-rose-200 text-rose-900'}`}>
                {supplierNetProfit >= 0 ? '+' : ''}{formatRs(supplierNetProfit)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Intake ({formatL(supplierPurchasedQty)} @ Rs.{supplierAvgRate}):</span>
              <span className="font-semibold text-rose-600">-{formatRs(supplierTotalProcurementCost)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
              <span>Supplier Sales:</span>
              <span>{formatRs(supplierTotalRevenue)}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
              <span>Route Expenses:</span>
              <span>-{formatRs(supplierTotalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Total Business Final P&L Banner */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
          isProfit
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20'
            : isLoss
            ? 'bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/20'
            : 'bg-slate-700 text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <div>
              <span className="text-[10px] uppercase tracking-wider block opacity-85">Total Business Final P&amp;L</span>
              <span className="text-sm sm:text-base font-black">
                {isProfit ? 'PROFIT: ' : isLoss ? 'LOSS: ' : 'BREAK-EVEN: '}
                {formatRs(finalBusinessProfit)}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-normal opacity-90 hidden sm:inline">
            Farm {farmNetProfit >= 0 ? `+${formatRs(farmNetProfit)}` : formatRs(farmNetProfit)} | Sup {supplierNetProfit >= 0 ? `+${formatRs(supplierNetProfit)}` : formatRs(supplierNetProfit)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* 2-Column Grid: 1. Farm P&L vs 2. Supplier P&L */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* ══════════════════════════════════════════════════════════════════
            1. FARM P&L SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Tractor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Farm P&amp;L</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                      In-House Herd
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Milking yield revenues vs feed, fodder, labor, and farm operating overheads
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Farm Status
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${farmNetProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {farmNetProfit >= 0 ? 'PROFIT' : 'LOSS'}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  Farm Raw Milk Revenue
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatRs(farmMilkRevenue)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Farm Dahi Revenue
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatRs(farmDahiRevenue)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700 bg-emerald-50/40 dark:bg-emerald-950/20 px-2.5 rounded-lg">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  Total Farm Revenue
                </span>
                <span className="font-black text-emerald-700 dark:text-emerald-300">
                  {formatRs(farmTotalRevenue)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-rose-500" />
                  Farm Operating Expenses (Feed, Chara, Wages, Utilities)
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  - {formatRs(farmTotalExpenses)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  <strong>Business Rule:</strong> Farm milk has zero external procurement purchasing cost.
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-900 text-white flex items-center justify-between border-t border-emerald-800">
            <div>
              <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold block">
                Farm Net Profit / Loss
              </span>
              <span className="text-xs text-emerald-200/80">Total Revenue - Total Farm Expenses</span>
            </div>
            <span className={`text-base sm:text-xl font-black ${farmNetProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {farmNetProfit >= 0 ? `+${formatRs(farmNetProfit)}` : formatRs(farmNetProfit)}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            2. SUPPLIER P&L SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Supplier P&amp;L</span>
                    <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      Procurement Operations
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Purchased milk volumes, dynamic procurement costs vs retail sales &amp; route overheads
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Supplier Status
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${supplierNetProfit >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                  {supplierNetProfit >= 0 ? 'PROFIT' : 'LOSS'}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  Supplier Milk Purchased Today
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatL(supplierPurchasedQty)} <span className="text-slate-400 font-normal">(@ avg Rs. {supplierAvgRate}/L)</span>
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 px-2.5 rounded-lg">
                <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                  Total Milk Procurement Cost
                </span>
                <span className="font-black text-rose-600 dark:text-rose-400">
                  - {formatRs(supplierTotalProcurementCost)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">
                  Supplier Milk Retail Revenue
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatRs(supplierMilkRevenue)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">
                  Supplier Dahi Revenue (Attributed Share)
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatRs(supplierDahiRevenue)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/20 px-2.5 rounded-lg">
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  Total Supplier Revenue
                </span>
                <span className="font-black text-blue-700 dark:text-blue-300">
                  {formatRs(supplierTotalRevenue)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-rose-500" />
                  Supplier Operating Expenses (Chiller, Fuel, Handling)
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  - {formatRs(supplierTotalExpenses)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-950 text-white flex items-center justify-between border-t border-blue-900">
            <div>
              <span className="text-[11px] text-blue-300 uppercase tracking-wider font-semibold block">
                Supplier Net Profit / Loss
              </span>
              <span className="text-xs text-blue-200/80">Total Revenue - Procurement Cost - Expenses</span>
            </div>
            <span className={`text-base sm:text-xl font-black ${supplierNetProfit >= 0 ? 'text-blue-300' : 'text-rose-300'}`}>
              {supplierNetProfit >= 0 ? `+${formatRs(supplierNetProfit)}` : formatRs(supplierNetProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. TOTAL BUSINESS FINAL P&L (HERO SUMMARY CARD)
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`rounded-2xl p-5 sm:p-6 text-white border shadow-lg transition-all ${
        isProfit
          ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 border-emerald-600 shadow-emerald-700/20'
          : isLoss
          ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 border-rose-700 shadow-rose-900/20'
          : 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 border-slate-600'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-white">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Consolidated Business Audit • {date || 'Selected Business Date'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                  Total Business Final P&amp;L
                </h2>
              </div>
            </div>
            <p className="text-xs text-white/80 pl-10 max-w-xl">
              Consolidated Net Financial Result: Farm Net Profit + Supplier Net Profit. Fully isolated mass-balance accounting with zero double counting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-black/25 backdrop-blur-sm p-4 rounded-xl border border-white/15">
            <div className="text-left sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-white/70 block font-semibold">
                Calculation Breakdown
              </span>
              <div className="text-xs text-white/90 font-medium">
                Farm ({farmNetProfit >= 0 ? `+${formatRs(farmNetProfit)}` : formatRs(farmNetProfit)})
                <span className="mx-1.5">+</span>
                Supplier ({supplierNetProfit >= 0 ? `+${formatRs(supplierNetProfit)}` : formatRs(supplierNetProfit)})
              </div>
            </div>

            <div className="text-left sm:text-right pl-0 sm:pl-4 sm:border-l border-white/20">
              <span className="text-xs uppercase tracking-wider text-white/80 font-bold block">
                {isProfit ? 'PROFIT' : isLoss ? 'LOSS' : 'BREAK-EVEN'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatRs(finalBusinessProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
