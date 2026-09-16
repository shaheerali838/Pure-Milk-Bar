import React from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Truck, Store, Layers, PieChart as PieIcon } from 'lucide-react';

export default function GrossRevenueDetail({ data, onClose, onBack }) {
  const handleBack = onBack || onClose;

  const {
    grossRevenue = 0,
    doorstepRevenue = 0,
    doorstepShare = 0,
    doorstepCount = 0,
    posRevenue = 0,
    posShare = 0,
    posCount = 0,
    wholesaleRevenue = 0,
    wholesaleShare = 0,
    wholesaleCount = 0,
    rawMilkRevenue = 0,
    valueAddedRevenue = 0,
    recentSales = [],
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
                <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">Gross Revenue Detail</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                  Consolidated Topline
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Channel Mix: <strong className="text-slate-800 font-bold">Doorstep &bull; POS &bull; Wholesale</strong>
          </span>
        </div>
      </div>

      {/* Main Consolidated Total Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
            Consolidated Gross Farm Revenue
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
            All 3 Channels Active
          </span>
        </div>
        <div className="text-3xl md:text-4xl font-black tracking-tight tabular my-2">
          {fmt(grossRevenue)}
        </div>
        <p className="text-xs text-emerald-100/90">
          Total sales revenue collected across Doorstep Deliveries, POS Counter, and Bulk Wholesale.
        </p>
      </div>

      {/* Product Stream Allocation - Redesigned Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Raw Milk Stream */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-blue-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Raw Milk Stream</span>
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                🥛
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular">
              {fmt(rawMilkRevenue)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Share of Gross</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
              {grossRevenue > 0 ? ((rawMilkRevenue / grossRevenue) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>

        {/* Value-Added Stream */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-teal-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Value-Added Stream (Farm Dahi)</span>
              <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                🥣
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular">
              {fmt(valueAddedRevenue)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Share of Gross</span>
            <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full text-[10px]">
              {grossRevenue > 0 ? ((valueAddedRevenue / grossRevenue) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column: Channels on Left, Recent Sales on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3 Channels Breakdown Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <PieIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Channel Share Distribution</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              100% Consolidated
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Doorstep Delivery Channel */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/40 via-white to-white hover:border-emerald-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Doorstep Delivery</p>
                    <p className="text-[11px] text-slate-500">{doorstepCount} orders fulfilled</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">{fmt(doorstepRevenue)}</p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {doorstepShare}% share
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, doorstepShare)}%` }}
                />
              </div>
            </div>

            {/* POS & Farm Gate Channel */}
            <div className="p-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/40 via-white to-white hover:border-blue-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">POS &amp; Farm Gate</p>
                    <p className="text-[11px] text-slate-500">{posCount} counter transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">{fmt(posRevenue)}</p>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {posShare}% share
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, posShare)}%` }}
                />
              </div>
            </div>

            {/* Bulk Wholesale Channel */}
            <div className="p-4 rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50/40 via-white to-white hover:border-purple-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Bulk Wholesale</p>
                    <p className="text-[11px] text-slate-500">{wholesaleCount} commercial supplies</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">{fmt(wholesaleRevenue)}</p>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                    {wholesaleShare}% share
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, wholesaleShare)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sales Transaction Stream Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Revenue Transactions</h3>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {recentSales.length} records
            </span>
          </div>

          {recentSales.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <p className="font-semibold text-slate-500">No revenue transactions logged</p>
              <p className="text-[11px] text-slate-400 mt-1">Transactions recorded in POS or Delivery will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
              {recentSales.map((sale, idx) => (
                <div key={idx} className="py-3 px-2 flex items-center justify-between text-xs hover:bg-slate-50/80 rounded-xl transition">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-slate-900 truncate">
                      {sale.invoiceId || `INV-#${idx + 1}`}
                      <span className="ml-2 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        {sale.channel || sale.fulfillmentMode || 'Counter'}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {sale.itemsSummary || `${sale.itemCount || 1} items`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-900 tabular text-sm">{fmt(sale.netPayable || sale.subtotal)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sale.formattedDate || sale.date || 'Today'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
