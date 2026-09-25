import React, { useMemo } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useDahiContext } from '@/context/DahiContext';
import { Link, useNavigate } from 'react-router-dom';

export default function DahiProcessingHub() {
  const navigate = useNavigate();
  const { products = [], inventoryMetrics = {} } = usePOSContext();
  const { animals = [] } = useAnimalContext();
  const { totals: intakeTotals = {} } = useIntakeContext();
  const { batches: processingBatches = [] } = useDahiContext() || {};

  const todayISO = new Date().toISOString().split('T')[0];

  // Batches recorded for today or all active batches
  const todayBatches = processingBatches.filter((b) => b.date === todayISO);
  const activeBatches = todayBatches.length > 0 ? todayBatches : processingBatches;

  // Processed products from context
  const dahiProducts = products.filter(
    (p) => p.category && p.category.toLowerCase().includes('dahi')
  );
  const activeDahiPrice =
    dahiProducts.length > 0 ? Number(dahiProducts[0].price) || 240 : 240;

  const milkProducts = products.filter(
    (p) => p.category && p.category.toLowerCase().includes('milk')
  );
  const milkPrice = Number(inventoryMetrics.milkPrice) || Number(milkProducts[0]?.price) || 210;

  // Live conversion statistics calculated purely from batches or POS inventory
  const rawMilkConverted = activeBatches.reduce((sum, b) => {
    const rawVal = parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;
    return sum + rawVal;
  }, 0) || (parseFloat(inventoryMetrics.totalDahi) ? parseFloat((parseFloat(inventoryMetrics.totalDahi) * 1.05).toFixed(1)) : 0);

  const dahiOutputKg = activeBatches.reduce((sum, b) => {
    const outVal = parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;
    return sum + outVal;
  }, 0) || (parseFloat(inventoryMetrics.totalDahi) || parseFloat(inventoryMetrics.dahiSold) || 0);

  // Source allocation (Farm vs Supplier)
  const totalFarmMilk = animals.reduce((s, a) => s + (parseFloat(a.totalDailyYield) || 0), 0);
  const totalProcured = Number(intakeTotals.totalProcuredVolume) || 0;
  const totalAvailable = totalFarmMilk + totalProcured;

  let farmMilkPortion = 0;
  let supMilkPortion = 0;
  if (totalAvailable > 0 && rawMilkConverted > 0) {
    farmMilkPortion = Math.round((totalFarmMilk / totalAvailable) * rawMilkConverted);
    supMilkPortion = Math.max(0, Math.round(rawMilkConverted - farmMilkPortion));
  } else if (rawMilkConverted > 0) {
    farmMilkPortion = Math.round(rawMilkConverted);
  }

  // Yield %
  const yieldPct = rawMilkConverted > 0 ? ((dahiOutputKg / rawMilkConverted) * 100).toFixed(1) : '0.0';

  // Revenue & margin uplift:
  const rawMilkCost = Math.round(rawMilkConverted * milkPrice);
  const finishedValue = Math.round(dahiOutputKg * activeDahiPrice);
  const valueAddProfit = Math.max(0, finishedValue - rawMilkCost);
  const marginUpliftPct = rawMilkCost > 0 ? ((valueAddProfit / rawMilkCost) * 100).toFixed(1) : '0.0';

  const completedCount = activeBatches.filter((b) => b.status === 'Completed').length;
  const inProgressCount = activeBatches.filter((b) => b.status === 'In Progress').length;

  return (
    <div
      onClick={() => navigate('/farm/processing')}
      className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group select-none relative overflow-hidden"
    >
      {/* Ambient Top Glow */}
      <div className="absolute -top-14 -right-14 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0092b8] text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-display leading-tight">
                Dahi &amp; Value-Add Processing
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Fresh Dahi, Matka Dahi &amp; Makhan
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-teal-50 text-teal-700 shrink-0">
            +{marginUpliftPct}% Uplift
          </span>
        </div>

        {/* Metric Data Rows */}
        <div className="py-3.5 space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600 text-xs font-semibold">Raw Milk Converted</span>
            <span className="font-mono font-bold text-slate-900 text-xs tabular">
              {rawMilkConverted.toFixed(1)} L (Farm: {farmMilkPortion}L • Sup: {supMilkPortion}L)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600 text-xs font-semibold">Finished Output</span>
            <span className="font-mono font-bold text-emerald-700 text-xs tabular">
              {dahiOutputKg.toFixed(1)} kg ({yieldPct}% Yield)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600 text-xs font-semibold">Available Dahi Stock</span>
            <span className="font-mono font-bold text-teal-700 text-xs tabular">
              {inventoryMetrics?.totalDahiStock || 0} kg (POS Ready)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600 text-xs font-semibold">Active Batches</span>
            <span className="font-mono font-bold text-slate-900 text-xs tabular">
              {inProgressCount} In Progress • {completedCount} Done
            </span>
          </div>
        </div>

        {/* Net Contribution Pill Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-cyan-500/15 flex items-center justify-between font-bold text-xs mb-4">
          <span className="text-slate-900 font-extrabold">Value-Add Gross Profit:</span>
          <span className="font-mono font-black text-emerald-700 text-sm tabular">
            +Rs. {valueAddProfit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Link
        to="/farm/processing"
        className="w-full py-3 px-5 rounded-2xl bg-[#0092b8] hover:bg-[#007f9f] text-white flex items-center justify-between text-xs font-extrabold transition-all shadow-md shadow-teal-600/20 hover:shadow-teal-600/35 cursor-pointer group"
      >
        <span>Open Dahi Processing Hub</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
