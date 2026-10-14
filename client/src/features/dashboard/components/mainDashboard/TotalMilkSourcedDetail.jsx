import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Droplets,
  Building2,
  Users,
  Store,
  Layers,
  Truck,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';
import { isMatchingTimeframe, getDateRangeBoundaries } from '@/utils/dateUtils';

export default function TotalMilkSourcedDetail({
  onBack,
  dateFilter = 'today',
  startDate = '',
  endDate = '',
}) {
  const navigate = useNavigate();

  const { milkingLogs = [], animals = [] } = useAnimalContext();
  const { intakeLogs = [], totals: intakeTotals = {} } = useIntakeContext();
  const { inventoryMetrics = {}, salesHistory = [] } = usePOSContext();

  const periodData = getDateRangeBoundaries(dateFilter, startDate, endDate);
  const periodLabel = periodData.label || 'Today';

  const metrics = useMemo(() => {
    // 1. Matched Milking
    const matchedMilking = milkingLogs.filter((l) =>
      isMatchingTimeframe(l.date, dateFilter, startDate, endDate)
    );

    let morningYield = 0;
    let eveningYield = 0;
    let cowYield = 0;
    let buffYield = 0;

    matchedMilking.forEach((log) => {
      const y = parseFloat(log.yieldLiters || log.yield) || 0;
      const shift = String(log.shift || '').toUpperCase();
      if (shift.includes('EVE') || shift.includes('NIGHT')) {
        eveningYield += y;
      } else {
        morningYield += y;
      }

      const animalType = String(log.animalType || log.animalId?.type || '').toLowerCase();
      if (animalType.includes('buff')) {
        buffYield += y;
      } else {
        cowYield += y;
      }
    });

    const farmYield =
      dateFilter === 'today' && matchedMilking.length === 0
        ? Number(inventoryMetrics.totalFarmYield) || 0
        : morningYield + eveningYield;

    // 2. Matched Intakes
    const matchedIntakes = intakeLogs.filter((i) =>
      isMatchingTimeframe(i.date || i.createdAt, dateFilter, startDate, endDate)
    );

    let supplierVolume = 0;
    let supplierBill = 0;
    let totalFatWeighted = 0;

    matchedIntakes.forEach((intake) => {
      const q = parseFloat(intake.quantity || intake.qty || 0);
      const r = parseFloat(intake.rate || intake.price || 0);
      const fat = parseFloat(intake.fat || intake.fatPercentage || 0);
      supplierVolume += q;
      supplierBill += intake.totalAmount !== undefined ? Number(intake.totalAmount) : q * r;
      if (fat > 0) totalFatWeighted += fat * q;
    });

    if (supplierVolume === 0 && dateFilter === 'today' && intakeTotals.totalProcuredVolume !== undefined) {
      supplierVolume = Number(intakeTotals.totalProcuredVolume || 0);
      supplierBill = Number(intakeTotals.totalProcurementCost || 0);
    }

    const avgFat = supplierVolume > 0 && totalFatWeighted > 0 ? (totalFatWeighted / supplierVolume).toFixed(1) : '6.5';
    const totalSourced = farmYield + supplierVolume;

    const farmPercent = totalSourced > 0 ? Math.round((farmYield / totalSourced) * 100) : 50;
    const supplierPercent = totalSourced > 0 ? Math.round((supplierVolume / totalSourced) * 100) : 50;

    // 3. Sales Outflow within timeframe
    const matchedSales = salesHistory.filter((s) =>
      isMatchingTimeframe(s.date || s.timestamp || s.createdAt, dateFilter, startDate, endDate)
    );
    let milkSold = 0;
    matchedSales.forEach((s) => {
      (s.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const isMilk = !name.includes('dahi') && !cat.includes('dahi') && (name.includes('milk') || cat.includes('milk'));
        if (isMilk) {
          milkSold += Number(item.quantity) || 0;
        }
      });
    });

    // 4. Inventory Chiller stocks
    const totalMilkStock = Number(inventoryMetrics?.totalMilkStock ?? 0);
    const farmMilkStock = Number(inventoryMetrics?.farmMilkStock ?? 0);
    const supplierMilkStock = Number(inventoryMetrics?.supplierMilkStock ?? 0);

    return {
      totalSourced,
      farmYield,
      morningYield,
      eveningYield,
      cowYield,
      buffYield,
      farmPercent,
      supplierVolume,
      supplierBill,
      avgFat,
      supplierPercent,
      suppliersCount: matchedIntakes.length,
      animalsMilkedCount: matchedMilking.length,
      milkSold,
      totalMilkStock,
      farmMilkStock,
      supplierMilkStock,
    };
  }, [milkingLogs, intakeLogs, intakeTotals, inventoryMetrics, salesHistory, dateFilter, startDate, endDate]);

  const fmtQty = (n) => Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

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
                  Total Milk Sourced Detail
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                  Consolidated Inflow
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
            Streams: <strong className="text-slate-800 font-bold">Farm Herd &amp; Supplier Dock</strong>
          </span>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards matching RawMilkDetail */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Sourced Volume */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Volume Sourced</span>
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular">
              {fmtQty(metrics.totalSourced)} <span className="text-sm font-bold text-slate-500">L</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Realized Inflow</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
              100% Monitored
            </span>
          </div>
        </div>

        {/* Card 2: Farm Herd Milking */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Farm Herd Yield</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tabular">
              {fmtQty(metrics.farmYield)} <span className="text-sm font-bold text-emerald-600/70">L</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">In-House Milking</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
              {metrics.farmPercent}% Sourced
            </span>
          </div>
        </div>

        {/* Card 3: Supplier Procurement */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Supplier Dock Intake</span>
              <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-sky-600 tabular">
              {fmtQty(metrics.supplierVolume)} <span className="text-sm font-bold text-sky-600/70">L</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">External Procurement</span>
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full text-[10px]">
              {metrics.supplierPercent}% Sourced
            </span>
          </div>
        </div>

        {/* Card 4: Available Chiller Stock */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Milk In Cold Storage</span>
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Store className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 tabular">
              {fmtQty(metrics.totalMilkStock)} <span className="text-sm font-bold text-indigo-600/70">L</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Chiller Available</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
              Ready for POS
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Side-by-Side Breakdown matching RawMilkDetail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sourcing Streams Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sourcing Hubs Breakdown</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              2 Streams Active
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Stream 1: In-House Farm Milking */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/40 via-white to-white hover:border-emerald-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Farm In-House Herd</p>
                    <p className="text-[11px] text-slate-500">
                      Morning: {fmtQty(metrics.morningYield)}L · Evening: {fmtQty(metrics.eveningYield)}L
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-700 tabular">
                    {fmtQty(metrics.farmYield)} L
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {metrics.farmPercent}% share
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.farmPercent)}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">
                  {metrics.cowYield > 0 || metrics.buffYield > 0
                    ? `Cow: ${fmtQty(metrics.cowYield)}L · Buff: ${fmtQty(metrics.buffYield)}L`
                    : 'Milking yield logs recorded'}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/farm/milking')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Milking Register <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stream 2: Dairy Supplier Intake */}
            <div className="p-4 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50/40 via-white to-white hover:border-sky-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Supplier Intake Dock</p>
                    <p className="text-[11px] text-slate-500">
                      Avg Fat: {metrics.avgFat}% · Bill: {fmt(metrics.supplierBill)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-sky-700 tabular">
                    {fmtQty(metrics.supplierVolume)} L
                  </p>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
                    {metrics.supplierPercent}% share
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.supplierPercent)}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">External dairy sourcing contracts</span>
                <button
                  type="button"
                  onClick={() => navigate('/supplier/intake')}
                  className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Supplier Dock <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chiller Stock & Outflow Balance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Chiller Stock &amp; Mass Balance</h3>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Live Tanks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Flow Metric</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Status / Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Total Inflow Sourced
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">{fmtQty(metrics.totalSourced)} L</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">Farm + Supplier</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Milk Dispatched &amp; Sold
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-700">{fmtQty(metrics.milkSold)} L</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">POS + Delivery</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      Farm Milk in Cold Room
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-teal-700">{fmtQty(metrics.farmMilkStock)} L</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">Farm Tank A</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      Supplier Milk in Cold Room
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-sky-700">{fmtQty(metrics.supplierMilkStock)} L</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">Supplier Tank B</td>
                </tr>

                {/* Final Row */}
                <tr className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-3">Total Milk Remaining in Chiller</td>
                  <td className="py-3 px-3 text-right text-indigo-700 text-sm">
                    {fmtQty(metrics.totalMilkStock)} L
                  </td>
                  <td className="py-3 px-3 text-right text-indigo-600 font-bold">Cold Storage Ready</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/pos')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Go to POS Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
