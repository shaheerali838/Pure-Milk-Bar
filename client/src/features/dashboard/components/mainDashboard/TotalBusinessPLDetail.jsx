import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Banknote,
  TrendingUp,
  TrendingDown,
  Building2,
  Droplets,
  Layers,
  Truck,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';
import { useExpense } from '@/context/ExpenseContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { isMatchingTimeframe, getDateRangeBoundaries } from '@/utils/dateUtils';

export default function TotalBusinessPLDetail({
  onBack,
  dateFilter = 'today',
  startDate = '',
  endDate = '',
}) {
  const navigate = useNavigate();

  const { milkingLogs = [] } = useAnimalContext();
  const { intakeLogs = [], totals: intakeTotals = {} } = useIntakeContext();
  const { salesHistory = [], inventoryMetrics = {} } = usePOSContext();
  const { expenses: farmExpenses = [] } = useExpense() || {};
  const { expenses: supplierExpenses = [] } = useSourcExpenseContext() || {};

  const periodData = getDateRangeBoundaries(dateFilter, startDate, endDate);
  const periodLabel = periodData.label || 'Today';

  // Calculate detailed financial breakdown
  const metrics = useMemo(() => {
    // 1. Sales
    const matchedSales = salesHistory.filter((s) => {
      const raw = s.date || s.timestamp || s.formattedDate || s.createdAt || '';
      return isMatchingTimeframe(raw, dateFilter, startDate, endDate);
    });

    let totalSalesRevenue = 0;
    let farmMilkRevenue = 0;
    let supplierMilkRevenue = 0;
    let farmDahiRevenue = 0;
    let supplierDahiRevenue = 0;
    let milkSoldLiters = 0;
    let dahiSoldKg = 0;

    matchedSales.forEach((sale) => {
      totalSalesRevenue += Number(sale.netPayable || sale.totalAmount || sale.grandTotal) || 0;
      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const src = (item.source || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal || item.effectiveRevenue) || qty * (Number(item.price) || 0);

        const isDahi =
          name.includes('dahi') ||
          cat.includes('dahi') ||
          name.includes('yogurt') ||
          cat.includes('yogurt') ||
          name.includes('curd');

        if (isDahi) {
          dahiSoldKg += qty;
          if (item.supplierRevenue !== undefined || item.farmRevenue !== undefined) {
            farmDahiRevenue += Number(item.farmRevenue) || 0;
            supplierDahiRevenue += Number(item.supplierRevenue) || 0;
          } else if (src.includes('supplier')) {
            supplierDahiRevenue += rev;
          } else {
            farmDahiRevenue += rev;
          }
        } else {
          milkSoldLiters += qty;
          if (item.supplierRevenue !== undefined || item.farmRevenue !== undefined) {
            farmMilkRevenue += Number(item.farmRevenue) || 0;
            supplierMilkRevenue += Number(item.supplierRevenue) || 0;
          } else if (src.includes('supplier')) {
            supplierMilkRevenue += rev;
          } else {
            farmMilkRevenue += rev;
          }
        }
      });
    });

    const totalFarmRevenue = Math.round(farmMilkRevenue + farmDahiRevenue);
    const totalSupplierRevenue = Math.round(supplierMilkRevenue + supplierDahiRevenue);

    // 2. Farm Expenses
    const matchedFarmExpenses = farmExpenses.filter((e) =>
      isMatchingTimeframe(e.date || e.createdAt, dateFilter, startDate, endDate)
    );
    const farmExpensesTotal = matchedFarmExpenses.reduce(
      (sum, e) => sum + (Number(e.amount || e.cost) || 0),
      0
    );

    // 3. Supplier Procurement Cost
    const matchedIntakes = intakeLogs.filter((i) =>
      isMatchingTimeframe(i.date || i.createdAt, dateFilter, startDate, endDate)
    );
    let supplierProcurementCost = 0;
    let supplierProcuredVolume = 0;
    matchedIntakes.forEach((intake) => {
      const qty = parseFloat(intake.quantity || intake.qty || 0);
      const rate = parseFloat(intake.rate || intake.price || 0);
      supplierProcuredVolume += qty;
      supplierProcurementCost += intake.totalAmount !== undefined ? Number(intake.totalAmount) : qty * rate;
    });

    if (supplierProcurementCost === 0 && dateFilter === 'today' && intakeTotals.totalProcurementCost) {
      supplierProcurementCost = Number(intakeTotals.totalProcurementCost);
      supplierProcuredVolume = Number(intakeTotals.totalProcuredVolume || 0);
    }

    // 4. Supplier Expenses
    const matchedSupplierExpenses = supplierExpenses.filter((e) =>
      isMatchingTimeframe(e.date || e.createdAt, dateFilter, startDate, endDate)
    );
    const supplierExpensesTotal = matchedSupplierExpenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0
    );

    const totalSupplierCosts = Math.round(supplierProcurementCost + supplierExpensesTotal);

    // 5. Net Profits
    const farmNetProfit = Math.round(totalFarmRevenue - farmExpensesTotal);
    const supplierNetProfit = Math.round(totalSupplierRevenue - totalSupplierCosts);
    const totalBusinessProfit = farmNetProfit + supplierNetProfit;
    const totalBusinessCosts = farmExpensesTotal + totalSupplierCosts;

    const netMargin =
      totalSalesRevenue > 0
        ? Math.round((totalBusinessProfit / totalSalesRevenue) * 100)
        : 0;

    const farmShare = totalSalesRevenue > 0 ? Math.round((totalFarmRevenue / totalSalesRevenue) * 100) : 50;
    const supplierShare = totalSalesRevenue > 0 ? Math.round((totalSupplierRevenue / totalSalesRevenue) * 100) : 50;

    return {
      totalSalesRevenue,
      totalBusinessCosts,
      totalBusinessProfit,
      netMargin,
      totalFarmRevenue,
      farmMilkRevenue,
      farmDahiRevenue,
      farmExpensesTotal,
      farmNetProfit,
      farmShare,
      totalSupplierRevenue,
      supplierMilkRevenue,
      supplierDahiRevenue,
      supplierProcurementCost,
      supplierProcuredVolume,
      supplierExpensesTotal,
      totalSupplierCosts,
      supplierNetProfit,
      supplierShare,
      milkSoldLiters,
      dahiSoldKg,
      totalDahiRevenue: farmDahiRevenue + supplierDahiRevenue,
    };
  }, [salesHistory, farmExpenses, intakeLogs, intakeTotals, supplierExpenses, dateFilter, startDate, endDate]);

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();
  const isProfitable = metrics.totalBusinessProfit >= 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Bar with Back Button matching RawMilkDetail pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">
                  Total Business Profit &amp; Loss Detail
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                  Consolidated P&amp;L
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Timeframe: <strong className="text-slate-800 font-bold">{periodLabel}</strong>
          </span>
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Scope: <strong className="text-slate-800 font-bold">Farm · Supplier · Dahi</strong>
          </span>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards matching RawMilkDetail */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Sales Revenue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sales Inflow</span>
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Banknote className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular">
              {fmt(metrics.totalSalesRevenue)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Inflow Collections</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
              All POS &amp; Routes
            </span>
          </div>
        </div>

        {/* Card 2: Total Operating Costs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Total Costs &amp; Exp</span>
              <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 tabular">
              {fmt(metrics.totalBusinessCosts)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Farm Ops + Supplier</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[10px]">
              Total Outflow
            </span>
          </div>
        </div>

        {/* Card 3: Total Net Profit */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Total Net Profit</span>
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${isProfitable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {isProfitable ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              </span>
            </div>
            <p className={`text-2xl sm:text-3xl font-black tabular ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(metrics.totalBusinessProfit)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Realized Bottomline</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${isProfitable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {isProfitable ? 'Profitable' : 'Deficit'}
            </span>
          </div>
        </div>

        {/* Card 4: Net Margin */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Net Profit Margin</span>
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                %
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 tabular">
              {metrics.netMargin}%
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Margin Efficiency</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
              Net Realized
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Side-by-Side Breakdown matching RawMilkDetail structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Business Units Performance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Segmented Operating Units</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              3 Modules Active
            </span>
          </div>

          <div className="space-y-3.5">
            {/* 1. Farm In-House Dairy */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/40 via-white to-white hover:border-emerald-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Farm Dairy (In-House)</p>
                    <p className="text-[11px] text-slate-500">
                      Revenue: {fmt(metrics.totalFarmRevenue)} · Expenses: {fmt(metrics.farmExpensesTotal)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black tabular ${metrics.farmNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {fmt(metrics.farmNetProfit)}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {metrics.farmShare}% share
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.farmShare)}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">Milk: {fmt(metrics.farmMilkRevenue)} · Dahi: {fmt(metrics.farmDahiRevenue)}</span>
                <button
                  type="button"
                  onClick={() => navigate('/farm/pl')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  View Farm P&amp;L <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 2. Supplier Procurement Hub */}
            <div className="p-4 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50/40 via-white to-white hover:border-sky-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Supplier Hub (Procured)</p>
                    <p className="text-[11px] text-slate-500">
                      Revenue: {fmt(metrics.totalSupplierRevenue)} · Costs: {fmt(metrics.totalSupplierCosts)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black tabular ${metrics.supplierNetProfit >= 0 ? 'text-sky-700' : 'text-rose-600'}`}>
                    {fmt(metrics.supplierNetProfit)}
                  </p>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
                    {metrics.supplierShare}% share
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.supplierShare)}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">Procured: {metrics.supplierProcuredVolume.toFixed(0)}L · Bill: {fmt(metrics.supplierProcurementCost)}</span>
                <button
                  type="button"
                  onClick={() => navigate('/supplier/pl')}
                  className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  View Supplier P&amp;L <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3. Dahi & Value Add */}
            <div className="p-4 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/40 via-white to-white hover:border-amber-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Dahi Value-Added Stream</p>
                    <p className="text-[11px] text-slate-500">
                      Output Sold: {metrics.dahiSoldKg.toFixed(1)} KG
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-700 tabular">
                    {fmt(metrics.totalDahiRevenue)}
                  </p>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    Value-Add
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">Higher Margin Processing Realization</span>
                <button
                  type="button"
                  onClick={() => navigate('/dahi')}
                  className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Open Dahi Hub <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Consolidated Stream Ledger Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Stream-Wise Profit &amp; Loss Ledger</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Audited Balance
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Revenue / Cost Stream</th>
                  <th className="py-2.5 px-3 text-right">Inflow (Sales)</th>
                  <th className="py-2.5 px-3 text-right">Outflow (Costs)</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Farm Fresh Milk
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">{fmt(metrics.farmMilkRevenue)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+{fmt(metrics.farmMilkRevenue)}</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Farm Fresh Dahi
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">{fmt(metrics.farmDahiRevenue)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+{fmt(metrics.farmDahiRevenue)}</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      Supplier Procured Milk
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">{fmt(metrics.supplierMilkRevenue)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right font-bold text-sky-700">+{fmt(metrics.supplierMilkRevenue)}</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      Supplier Dahi
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">{fmt(metrics.supplierDahiRevenue)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right font-bold text-sky-700">+{fmt(metrics.supplierDahiRevenue)}</td>
                </tr>

                <tr className="bg-rose-50/30">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Farm Operating Expenses
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right font-medium text-rose-600">{fmt(metrics.farmExpensesTotal)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">-{fmt(metrics.farmExpensesTotal)}</td>
                </tr>

                <tr className="bg-rose-50/30">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Supplier Procurement &amp; Ops
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right font-medium text-rose-600">{fmt(metrics.totalSupplierCosts)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">-{fmt(metrics.totalSupplierCosts)}</td>
                </tr>

                {/* Final Row */}
                <tr className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-3">Total Consolidated Business</td>
                  <td className="py-3 px-3 text-right text-blue-700">{fmt(metrics.totalSalesRevenue)}</td>
                  <td className="py-3 px-3 text-right text-rose-600">{fmt(metrics.totalBusinessCosts)}</td>
                  <td className={`py-3 px-3 text-right text-sm ${isProfitable ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {fmt(metrics.totalBusinessProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
