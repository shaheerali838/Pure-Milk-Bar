import React from 'react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Minus, Equal, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export default function NetProfitDetail({ data, onClose, onBack }) {
  const handleBack = onBack || onClose;

  const {
    netProfit = 0,
    grossRevenue = 0,
    totalFarmCost = 0,
    profitPerLiter = 0,
    netMargin = 0,
    totalVolume = 0,
  } = data || {};

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();
  const isProfitable = Number(netProfit) >= 0;

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
                <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">Net Profit Detail</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isProfitable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {isProfitable ? 'Profitable Operation' : 'Operating Loss'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Profit Margin: <strong className={isProfitable ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{netMargin}%</strong>
          </span>
        </div>
      </div>

      {/* Main Net Profit Banner */}
      <div className={`p-6 rounded-2xl text-white shadow-sm ${
        isProfitable 
          ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800' 
          : 'bg-gradient-to-r from-rose-600 via-rose-700 to-red-800'
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">
            Farm Net Take-Home Profit
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
            Net Margin: {netMargin}%
          </span>
        </div>
        <div className="text-3xl md:text-4xl font-black tracking-tight tabular my-2">
          {fmt(netProfit)}
        </div>
        <p className="text-xs text-indigo-100/90">
          {isProfitable 
            ? 'True net surplus after deducting all cattle feed, veterinary, staff wages & utility bills.'
            : 'Expenses exceed gross revenue in this selected timeframe.'}
        </p>
      </div>

      {/* 2-Column: Step-by-Step Formula on Left, Unit Economics & Health on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step-by-Step Income Minus Bills Calculation Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Step-by-Step P&amp;L Formula</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Operating Statement
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Step 1: Gross Inflow Card */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/50 via-white to-white hover:border-emerald-300 transition-all duration-150">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                  +
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Total Farm Income / Gross Revenue</p>
                  <p className="text-[11px] text-slate-500">All channels (Doorstep, POS &amp; Wholesale)</p>
                </div>
              </div>
              <p className="text-base font-black text-emerald-600 tabular">
                {fmt(grossRevenue)}
              </p>
            </div>

            {/* Step 2: Total Bills Card */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/50 via-white to-white hover:border-rose-300 transition-all duration-150">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                  -
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Total Farm Bills &amp; Operating Expenses</p>
                  <p className="text-[11px] text-slate-500">Feed, wanda, labor, energy, veterinary &amp; repairs</p>
                </div>
              </div>
              <p className="text-base font-black text-rose-600 tabular">
                {fmt(totalFarmCost)}
              </p>
            </div>

            {/* Step 3: Net Take-Home Profit Result Card */}
            <div className="flex items-center justify-between p-4.5 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-md">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/20 text-white font-black text-base flex items-center justify-center shrink-0">
                  =
                </span>
                <div>
                  <p className="text-xs font-bold text-white">Net Take-Home Operating Surplus</p>
                  <p className="text-[11px] text-slate-400">Pure net bottom-line retention</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-emerald-400 tabular">
                  {fmt(netProfit)}
                </p>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Margin: {netMargin}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Economics & Health */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profit Per Liter Card */}
            <div className="bg-white border border-slate-200/90 border-t-4 border-t-blue-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Profit Per Liter</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">Unit Return</span>
                </div>
                <p className="text-3xl font-black text-blue-700 tabular my-1">
                  Rs. {Number(profitPerLiter).toFixed(2)} <span className="text-sm font-bold text-slate-500">/ L</span>
                </p>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                Calculated on <strong className="text-slate-700 font-bold">{Number(totalVolume).toFixed(1)} L</strong> active volume.
              </p>
            </div>

            {/* Net Margin Ratio Card */}
            <div className="bg-white border border-slate-200/90 border-t-4 border-t-indigo-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Net Margin Ratio</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">Efficiency</span>
                </div>
                <p className="text-3xl font-black text-indigo-700 tabular my-1">
                  {netMargin}%
                </p>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                Share of gross income retained as operational take-home.
              </p>
            </div>
          </div>

          {/* Financial Health Overview Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Financial Health Overview
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every liter of milk produced and sold directly converts to bottom-line profitability when feed costs and overheads are kept strictly optimized. Regular monitoring of per-liter return ensures sustainable dairy farming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
