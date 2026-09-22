import React, { useState } from 'react';
import { Calculator, Sparkles, TrendingUp, ArrowRight, DollarSign, Scale, Milk } from 'lucide-react';

export default function DahiProfitCalculator() {
  const [milkInputLiters, setMilkInputLiters] = useState(50);
  const [milkCostPerLiter, setMilkCostPerLiter] = useState(210);
  const [dahiSellingPricePerKg, setDahiSellingPricePerKg] = useState(320);
  const [cultureGasCost, setCultureGasCost] = useState(350);
  const [yieldPercent, setYieldPercent] = useState(98.5);

  const totalRawCost = milkInputLiters * milkCostPerLiter;
  const dahiOutputKg = Number(((milkInputLiters * yieldPercent) / 100).toFixed(1));
  const grossRevenue = Math.round(dahiOutputKg * dahiSellingPricePerKg);
  const totalCost = totalRawCost + Number(cultureGasCost);
  const netProfit = Math.max(0, grossRevenue - totalCost);
  const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';
  const profitPerKg = dahiOutputKg > 0 ? Math.round(netProfit / dahiOutputKg) : 0;
  const extraGainOverRaw = Math.max(0, grossRevenue - totalRawCost);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Simple Dahi Profit &amp; Yield Calculator
            </h3>
            <p className="text-[11.5px] text-slate-500">
              Calculate milk-to-dahi conversion margins, processing expenses &amp; net uplift
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Live Interactive Simulator
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Inputs */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Input Variables
          </h4>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Milk Input Volume (Liters)</span>
              <span className="font-bold text-slate-900">{milkInputLiters} L</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={milkInputLiters}
              onChange={(e) => setMilkInputLiters(Number(e.target.value))}
              className="w-full accent-[#009689]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Milk Cost / Liter (Rs.)
              </label>
              <input
                type="number"
                value={milkCostPerLiter}
                onChange={(e) => setMilkCostPerLiter(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#009689] font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Dahi Selling Rate / kg (Rs.)
              </label>
              <input
                type="number"
                value={dahiSellingPricePerKg}
                onChange={(e) => setDahiSellingPricePerKg(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#009689] font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Culture, Gas &amp; Pot Cost (Rs.)
              </label>
              <input
                type="number"
                value={cultureGasCost}
                onChange={(e) => setCultureGasCost(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#009689] font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Yield Conversion Ratio (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={yieldPercent}
                onChange={(e) => setYieldPercent(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#009689] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right Computed Results */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Profit Breakdown
          </h4>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Expected Dahi Yield:</span>
              <span className="font-bold text-slate-900">{dahiOutputKg} kg</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Raw Milk Input Cost:</span>
              <span className="font-bold text-slate-900">Rs. {totalRawCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Estimated Gross Revenue:</span>
              <span className="font-bold text-slate-900">Rs. {grossRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Profit Per kg of Dahi:</span>
              <span className="font-bold text-emerald-600">+Rs. {profitPerKg} / kg</span>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                NET VALUE-ADD PROFIT
              </p>
              <p className="text-2xl font-black text-emerald-700 font-display">
                +Rs. {netProfit.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {profitMargin}% Margin
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                Rs. {extraGainOverRaw.toLocaleString()} extra vs liquid
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
