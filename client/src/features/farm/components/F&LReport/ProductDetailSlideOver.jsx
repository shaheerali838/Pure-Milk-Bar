import React from 'react';
import { ArrowLeft, Droplets, Truck, Store, Layers, TrendingUp, DollarSign, Package, CheckCircle2 } from 'lucide-react';

export default function ProductDetailSlideOver({ product, onClose, onBack }) {
  if (!product) return null;

  const handleBack = onBack || onClose;
  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  const {
    name = 'Product Detail',
    category = 'Raw Milk',
    unit = 'L',
    totalOutput = 0,
    grossRealized = 0,
    directCost = 0,
    netProfit = 0,
    netMargin = 0,
    sellingRate = 0,
    channelSplit = {
      doorstep: { volume: 0, revenue: 0, share: 0 },
      pos: { volume: 0, revenue: 0, share: 0 },
      wholesale: { volume: 0, revenue: 0, share: 0 },
    },
    recentTransactions = [],
  } = product;

  const lowerName = (name || '').toLowerCase();
  const isCow = lowerName.includes('cow');
  const isBuffalo = lowerName.includes('buffalo');
  const isProcessed = lowerName.includes('processed') || lowerName.includes('value-added');

  const badgeColor = isCow ? 'bg-blue-100 text-blue-700'
    : isBuffalo ? 'bg-indigo-100 text-indigo-700'
    : isDahi ? 'bg-teal-100 text-teal-700'
    : isProcessed ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-100 text-emerald-700';

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
                <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">{name}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor}`}>
                  {category}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Selling Rate: <strong className="text-slate-800 font-bold">Rs. {sellingRate} / {unit}</strong>
          </span>
        </div>
      </div>

      {/* Top 4 KPI Metrics - Redesigned Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Output Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-blue-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Output</span>
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular">
              {Number(totalOutput).toFixed(1)} <span className="text-sm font-bold text-slate-500">{unit}</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Realized Volume</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">Active</span>
          </div>
        </div>

        {/* Gross Realized Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-emerald-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Gross Realized</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tabular">
              {fmt(grossRealized)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Total Inflow</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">Realized</span>
          </div>
        </div>

        {/* Direct Cost Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-amber-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Direct Cost</span>
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 tabular">
              {fmt(directCost)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Feed &amp; Direct</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">COGS Base</span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white border border-slate-200/90 border-t-4 border-t-indigo-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Net Profit</span>
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                %
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 tabular">
              {fmt(netProfit)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{netMargin}% Realized</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">Margin</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Channels on Left, Recent Sales on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3 Selling Channels Split Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">3 Selling Channels Split</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Doorstep &bull; POS &bull; Wholesale
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
                      {Number(channelSplit.doorstep?.volume || 0).toFixed(1)} {unit} dispatched
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">
                    {fmt(channelSplit.doorstep?.revenue || 0)}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {channelSplit.doorstep?.share || 0}% share
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, channelSplit.doorstep?.share || 0)}%` }}
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
                      {Number(channelSplit.pos?.volume || 0).toFixed(1)} {unit} counter sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">
                    {fmt(channelSplit.pos?.revenue || 0)}
                  </p>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {channelSplit.pos?.share || 0}% share
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, channelSplit.pos?.share || 0)}%` }}
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
                      {Number(channelSplit.wholesale?.volume || 0).toFixed(1)} {unit} bulk commercial
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular">
                    {fmt(channelSplit.wholesale?.revenue || 0)}
                  </p>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                    {channelSplit.wholesale?.share || 0}% share
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, channelSplit.wholesale?.share || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Product Transactions Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent {name} Sales</h3>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {recentTransactions.length} logs
            </span>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <p className="font-semibold text-slate-500">No direct sales logged for {name}</p>
              <p className="text-[11px] text-slate-400 mt-1">Sales entries recorded via POS or Delivery will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
              {recentTransactions.map((tx, idx) => (
                <div key={idx} className="py-3 px-2 flex items-center justify-between text-xs hover:bg-slate-50/80 rounded-xl transition">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-slate-900 truncate">
                      {tx.qty} {unit} @ Rs. {tx.rate}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                      {tx.date && <span>{tx.date}</span>}
                      {tx.channel && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                          {tx.channel}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-black text-slate-900 tabular text-sm shrink-0">{fmt(tx.subtotal)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
