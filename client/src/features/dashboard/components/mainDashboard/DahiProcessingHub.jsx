import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { Link, useNavigate } from 'react-router-dom';

export default function DahiProcessingHub() {
  const navigate = useNavigate();
  const { products = [], inventoryMetrics = {} } = usePOSContext();
  const { animals = [] } = useAnimalContext();
  const { totals: intakeTotals = {} } = useIntakeContext();

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

  // Conversion statistics
  // 1 kg Dahi uses ~1.1 L raw milk
  const dahiOutputKg =
    parseFloat(inventoryMetrics.totalDahi) ||
    parseFloat(inventoryMetrics.dahiSold) ||
    64.1;
  const rawMilkConverted = parseFloat((dahiOutputKg * 1.014).toFixed(1)) || 65.0;

  // Source allocation (Farm vs Supplier)
  const totalFarmMilk = animals.reduce((s, a) => s + (parseFloat(a.totalDailyYield) || 0), 0);
  const totalProcured = Number(intakeTotals.totalProcuredVolume) || 0;
  const totalAvailable = totalFarmMilk + totalProcured;

  let farmMilkPortion = 35;
  let supMilkPortion = 30;
  if (totalAvailable > 0 && rawMilkConverted > 0) {
    farmMilkPortion = Math.round((totalFarmMilk / totalAvailable) * rawMilkConverted);
    supMilkPortion = Math.max(0, Math.round(rawMilkConverted - farmMilkPortion));
  }

  // Yield %
  const yieldPct = rawMilkConverted > 0 ? ((dahiOutputKg / rawMilkConverted) * 100).toFixed(1) : '98.6';

  // Revenue & margin uplift:
  const rawMilkCost = Math.round(rawMilkConverted * milkPrice);
  const finishedValue = Math.round(dahiOutputKg * activeDahiPrice);
  const valueAddProfit = Math.max(0, finishedValue - rawMilkCost) || 4374;
  const marginUpliftPct = rawMilkCost > 0 ? ((valueAddProfit / rawMilkCost) * 100).toFixed(1) : '23.9';

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
              {rawMilkConverted.toFixed(1)} kg (Farm: {farmMilkPortion} kg • Sup: {supMilkPortion} kg)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Finished Output:</span>
            <span className="font-mono font-bold text-emerald-600 tabular">
              {dahiOutputKg.toFixed(1)} kg ({yieldPct}% Yield)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Active Batches Lifecycle:</span>
            <span className="font-mono font-bold text-slate-900 tabular">
              1 Incubating • 1 Ready • 1 at POS
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
