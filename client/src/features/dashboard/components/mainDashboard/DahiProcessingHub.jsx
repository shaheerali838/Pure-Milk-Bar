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
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group select-none"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0092b8] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display leading-tight">
                Dahi &amp; Value-Add Processing
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Fresh Dahi, Matka Dahi &amp; Makhan
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4] shrink-0">
            +{marginUpliftPct}% Uplift
          </span>
        </div>

        {/* Data Rows */}
        <div className="py-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Raw Milk Converted Today:</span>
            <span className="font-mono font-bold text-slate-900 tabular">
              {rawMilkConverted.toFixed(1)} L (Farm: {farmMilkPortion} L • Sup: {supMilkPortion} L)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Finished Output:</span>
            <span className="font-mono font-bold text-emerald-600 tabular">
              {dahiOutputKg.toFixed(1)} kg ({yieldPct}% Yield)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Available Dahi Stock (POS):</span>
            <span className="font-mono font-bold text-cyan-700 tabular">
              {inventoryMetrics?.totalDahiStock || 0} kg (At Counter Ready)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Active Batches Lifecycle:</span>
            <span className="font-mono font-bold text-slate-900 tabular">
              {inProgressCount} In Progress • {completedCount} Completed
            </span>
          </div>
        </div>

        {/* Highlight Net Contribution Row */}
        <div className="pt-3 pb-2 border-t border-slate-100 flex items-center justify-between font-bold text-xs">
          <span className="text-slate-900">Value-Add Gross Profit:</span>
          <span className="font-mono font-bold text-emerald-600 tabular">
            +Rs. {valueAddProfit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bottom Full-Width Pill Action Button */}
      <div className="mt-2 pt-1">
        <Link
          to="/farm/processing"
          className="w-full py-2.5 px-5 rounded-full bg-[#0092b8] hover:bg-[#007f9f] text-white flex items-center justify-between text-xs font-bold transition-all shadow-xs group cursor-pointer"
        >
          <span>Open Dahi Processing Hub</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
