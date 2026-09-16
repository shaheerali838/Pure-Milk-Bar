import React from 'react';
import { ArrowLeft, Droplets, TrendingUp, DollarSign, Truck, Store, Layers, CheckCircle2 } from 'lucide-react';

export default function RawMilkDetail({ data, onClose, onBack }) {
  const handleBack = onBack || onClose;

  const {
    rawMilkVolume = 0,
    rawMilkRevenue = 0,
    rawMilkCogs = 0,
    rawMilkMargin = 0,
    channelBreakdown = {
      doorstep: { volume: 0, revenue: 0, share: 0 },
      pos: { volume: 0, revenue: 0, share: 0 },
      wholesale: { volume: 0, revenue: 0, share: 0 },
    },
    milkItems = [],
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
                <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">Raw Milk Stream Detail</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                  Direct Stream
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Stream Type: <strong className="text-slate-800 font-bold">Cow &amp; Buffalo Milk</strong>
          </span>
        </div>
      </div>

      {/* Top 4 KPI Metrics - Redesigned Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Volume Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-blue-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Volume</span>
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular">
              {Number(rawMilkVolume).toFixed(1)} <span className="text-sm font-bold text-slate-500">L</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Realized Output</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">100% Monitored</span>
          </div>
        </div>

        {/* Gross Revenue Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-emerald-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Gross Revenue</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tabular">
              {fmt(rawMilkRevenue)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Inflow Collections</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">Raw Milk</span>
          </div>
        </div>

        {/* Direct COGS Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-amber-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Direct COGS</span>
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 tabular">
              {fmt(rawMilkCogs)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Feed &amp; Direct Cost</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">COGS Base</span>
          </div>
        </div>

        {/* Gross Margin Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-indigo-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Gross Margin</span>
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                %
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 tabular">
              {rawMilkMargin}%
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Realized Margin</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">Net Realization</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Selling Channels on Left, Itemized Sales on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selling Channels Breakdown Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Selling Channels Breakdown</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              3 Channels Active
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Doorstep Delivery Card */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/40 via-white to-white hover:border-emerald-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Doorstep Delivery</p>
                    <p className="text-[11px] text-slate-500">
                      {Number(channelBreakdown.doorstep.volume).toFixed(1)} Liters dispatched
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">
                    {fmt(channelBreakdown.doorstep.revenue)}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {channelBreakdown.doorstep.share}% share
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, channelBreakdown.doorstep.share)}%` }}
                />
              </div>
            </div>

            {/* POS & Farm Gate Card */}
            <div className="p-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/40 via-white to-white hover:border-blue-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">POS &amp; Farm Gate</p>
                    <p className="text-[11px] text-slate-500">
                      {Number(channelBreakdown.pos.volume).toFixed(1)} Liters counter cash/khata
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">
                    {fmt(channelBreakdown.pos.revenue)}
                  </p>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {channelBreakdown.pos.share}% share
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, channelBreakdown.pos.share)}%` }}
                />
              </div>
            </div>

            {/* Bulk Wholesale Card */}
            <div className="p-4 rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50/40 via-white to-white hover:border-purple-300 transition-all duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Bulk Wholesale</p>
                    <p className="text-[11px] text-slate-500">
                      {Number(channelBreakdown.wholesale.volume).toFixed(1)} Liters commercial supplies
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">
                    {fmt(channelBreakdown.wholesale.revenue)}
                  </p>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                    {channelBreakdown.wholesale.share}% share
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, channelBreakdown.wholesale.share)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Milk Sales Records Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Itemized Milk Sales Recorded</h3>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {milkItems.length} items logged
            </span>
          </div>

          {milkItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <p className="font-semibold text-slate-500">No milk sales logged in this period</p>
              <p className="text-[11px] text-slate-400 mt-1">Direct sales recorded via POS or Delivery will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
              {milkItems.map((item, idx) => (
                <div key={idx} className="py-3 px-2 flex items-center justify-between text-xs hover:bg-slate-50/80 rounded-xl transition">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.quantity} {item.unit || 'L'}
                      </span>
                      <span>@ Rs. {item.price || 0}</span>
                      {item.channel && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                          {item.channel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-900 tabular text-sm">{fmt(item.subtotal)}</p>
                    {item.date && <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>}
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
