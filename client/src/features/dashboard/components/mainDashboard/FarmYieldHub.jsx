import React from 'react';
import { Tractor, ArrowRight } from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useExpense } from '@/context/ExpenseContext';
import { usePOSContext } from '@/context/POSContext';
import { Link, useNavigate } from 'react-router-dom';

export default function FarmYieldHub() {
  const navigate = useNavigate();
  const { animals = [] } = useAnimalContext();
  const { totals: expenseTotals = {} } = useExpense();
  const { products = [], inventoryMetrics = {} } = usePOSContext();

  // Milking animals count
  const milkingAnimals = animals.filter(
    (a) => a.lactationStatus === 'Milking' || parseFloat(a.totalDailyYield) > 0
  );

  const totalFarmYield = animals.reduce(
    (sum, a) => sum + (parseFloat(a.totalDailyYield) || 0),
    0
  );

  // Valuation: Farm milk value @ retail milk rate
  const milkProduct = products.find(
    (p) => (p.category || '').toLowerCase().includes('milk') || (p.name || '').toLowerCase().includes('milk')
  );
  const milkRate = Number(inventoryMetrics.milkPrice) || Number(milkProduct?.price) || 180;
  const farmValuation = Math.round(totalFarmYield * milkRate);

  // Feed expenses from expense context
  const feedExpenses = Number(expenseTotals.feedSeedFarming) || Number(expenseTotals.totalFarmExpense) || 0;

  // Net Margin
  const netMargin = farmValuation - feedExpenses;
  const marginPercent = farmValuation > 0 ? ((netMargin / farmValuation) * 100).toFixed(1) : '0.0';

  return (
    <div
      onClick={() => navigate('/farm')}
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group select-none"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#009966] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Tractor className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display leading-tight">
                Farm Livestock &amp; Yield
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Internal herd yield &amp; feed costs
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] shrink-0">
            +{marginPercent}% Margin
          </span>
        </div>

        {/* Data Rows */}
        <div className="py-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Milk Yield Today:</span>
            <span className="font-mono font-bold text-slate-900 tabular">
              {totalFarmYield.toFixed(1)} L ({milkingAnimals.length} In-Milk Cows &amp; Buffaloes)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Farm Milk Internal Valuation:</span>
            <span className="font-mono font-bold text-emerald-600 tabular">
              Rs. {farmValuation.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Available Farm Milk Stock:</span>
            <span className="font-mono font-bold text-emerald-700 tabular">
              {inventoryMetrics?.farmMilkStock || 0} L (In Farm Chiller)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Feed, Silage &amp; Barn Expenses:</span>
            <span className="font-mono font-bold text-rose-500 tabular">
              Rs. {feedExpenses.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Highlight Net Contribution Row */}
        <div className="pt-3 pb-2 border-t border-slate-100 flex items-center justify-between font-bold text-xs">
          <span className="text-slate-900">Net Farm Contribution:</span>
          <span className="font-mono font-bold text-emerald-600 tabular">
            {netMargin >= 0 ? `+Rs. ${netMargin.toLocaleString()}` : `-Rs. ${Math.abs(netMargin).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Bottom Full-Width Pill Action Button */}
      <div className="mt-2 pt-1">
        <Link
          to="/farm"
          className="w-full py-2.5 px-5 rounded-full bg-[#009966] hover:bg-[#008557] text-white flex items-center justify-between text-xs font-bold transition-all shadow-xs group cursor-pointer"
        >
          <span>Open Farm Operations Hub</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
