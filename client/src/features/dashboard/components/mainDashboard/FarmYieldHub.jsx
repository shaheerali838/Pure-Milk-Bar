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
      className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group select-none relative overflow-hidden"
    >
      {/* Ambient Top Glow */}
      <div className="absolute -top-14 -right-14 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#009966] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-display leading-tight">
                Farm Livestock &amp; Yield
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Internal herd yield &amp; feed costs
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 shrink-0">
            +{marginPercent}% Margin
          </span>
        </div>

        {/* Metric Data Rows */}
        <div className="py-3.5 space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600 text-xs font-semibold">Milk Yield Today</span>
            <span className="font-mono font-bold text-slate-900 text-xs tabular">
              {totalFarmYield.toFixed(1)} L ({milkingAnimals.length} In-Milk Herd)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600 text-xs font-semibold">Internal Valuation</span>
            <span className="font-mono font-bold text-emerald-700 text-xs tabular">
              Rs. {farmValuation.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600 text-xs font-semibold">Farm Milk Stock</span>
            <span className="font-mono font-bold text-emerald-700 text-xs tabular">
              {inventoryMetrics?.farmMilkStock || 0} L (Chiller)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600 text-xs font-semibold">Feed &amp; Barn Expenses</span>
            <span className="font-mono font-bold text-rose-600 text-xs tabular">
              Rs. {feedExpenses.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Net Contribution Pill Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/15 flex items-center justify-between font-bold text-xs mb-4">
          <span className="text-slate-900 font-extrabold">Net Farm Contribution:</span>
          <span className="font-mono font-black text-emerald-700 text-sm tabular">
            {netMargin >= 0 ? `+Rs. ${netMargin.toLocaleString()}` : `-Rs. ${Math.abs(netMargin).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Link
        to="/farm"
        className="w-full py-3 px-5 rounded-2xl bg-[#009966] hover:bg-[#008557] text-white flex items-center justify-between text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/35 cursor-pointer group"
      >
        <span>Open Farm Operations Hub</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
