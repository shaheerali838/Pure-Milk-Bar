import React from 'react';
import { ArrowLeft, Layers, Package, TrendingUp, Sparkles, DollarSign } from 'lucide-react';

export default function ValueAddedDetail({ data, onClose, onBack }) {
  const handleBack = onBack || onClose;

  const {
    valueAddedRevenue = 0,
    packagingCost = 0,
    netMarginGain = 0,
    netMarginPercent = 0,
    productsList = [],
  } = data || {};

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Navigation Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Farm P&L
          </button>
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">Value-Added Stream Detail</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-700">
                  Processed Stream
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Processed Line: <strong className="text-slate-800 font-bold">{productsList.length} Active Items</strong>
          </span>
        </div>
      </div>

      {/* Top 4 KPI Metrics - Redesigned Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-teal-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Total Revenue</span>
              <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-teal-700 tabular">
              {fmt(valueAddedRevenue)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Value-Added Inflow</span>
            <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full text-[10px]">Realized</span>
          </div>
        </div>

        {/* Packaging Cost Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-amber-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Packaging Cost</span>
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 tabular">
              {fmt(packagingCost)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Pots, Tubs &amp; Seals</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">Direct Cost</span>
          </div>
        </div>

        {/* Net Margin Gain Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-emerald-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Net Margin Gain</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tabular">
              {fmt(netMarginGain)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Net Realized Gain</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">Surplus</span>
          </div>
        </div>

        {/* Processing Premium Margin % Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-purple-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Net Margin %</span>
              <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                %
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-700 tabular">
              {netMarginPercent}%
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Processing Premium</span>
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-[10px]">Efficiency</span>
          </div>
        </div>
      </div>

      {/* Value-Added Products Breakdown Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Value-Added Product Line (Farm-Set Dahi)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {productsList.length} Products Monitored
          </span>
        </div>

        {productsList.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <p className="font-semibold text-slate-500">No value-added sales logged in this period</p>
            <p className="text-[11px] text-slate-400 mt-1">Processed products sold in POS or Deliveries will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-center">Qty Sold</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">Packaging Cost</th>
                  <th className="py-3 px-4 text-right">Net Margin Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productsList.map((prod, idx) => {
                  const pName = (prod.name || '').toLowerCase();
                  const iconEmoji = pName.includes('dahi') ? '🥣' : (pName.includes('lassi') ? '🧃' : '🥛');

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0">
                            {iconEmoji}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{prod.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium">{prod.category || 'Processed Line'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg tabular">
                          {prod.quantity} {prod.unit || 'units'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 tabular text-sm">
                        {fmt(prod.revenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 tabular font-semibold">
                        {fmt(prod.packagingCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-black text-emerald-600 text-sm">{fmt(prod.netGain)}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50 mt-0.5">
                            {prod.margin}% margin
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Value Addition Insights Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/50 border border-teal-200/60 shadow-xs flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
          <Sparkles className="w-4 h-4 text-teal-600" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-teal-950 mb-1">Value-Added Margin Lift Strategy</h4>
          <p className="text-xs text-teal-900/90 leading-relaxed">
            Converting raw milk into value-added products like Farm-Set Dahi elevates revenue per liter significantly compared to wholesale gate milk. Direct packaging and processing cost are automatically separated from raw farm feed expenses.
          </p>
        </div>
      </div>
    </div>
  );
}
