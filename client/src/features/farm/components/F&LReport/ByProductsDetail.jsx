import React from 'react';
import { ArrowLeft, Sparkles, TrendingUp, DollarSign, Leaf, Recycle } from 'lucide-react';

export default function ByProductsDetail({ data, onClose, onBack }) {
  const handleBack = onBack || onClose;

  const {
    byProductsRevenue = 0,
    byProductsCount = 0,
    byProductsList = [],
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
                <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">By-Products Stream Detail</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                  Secondary Stream
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Logged Secondary Sales: <strong className="text-slate-800 font-bold">{byProductsCount}</strong>
          </span>
        </div>
      </div>

      {/* Main By-Products Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
            Total By-Product &amp; Secondary Revenue
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
            {byProductsCount} Logged Records
          </span>
        </div>
        <div className="text-3xl md:text-4xl font-black tracking-tight tabular my-2">
          {fmt(byProductsRevenue)}
        </div>
        <p className="text-xs text-amber-100/90">
          Recovered revenue from agricultural compost, dried cow dung cakes, whey and livestock sales.
        </p>
      </div>

      {/* 2 Streams Cards - Redesigned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-amber-500 shadow-xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-amber-700" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Farm Secondary</h4>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Secondary Line
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            Secondary farm production sold to local partners or repurposed.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-teal-500 shadow-xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                <Recycle className="w-4 h-4 text-teal-700" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Whey &amp; Dairy Processing</h4>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              Dairy Recovery
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            Nutrient-rich whey liquid recovered during processing, utilized for cattle feed enrichment or commercial sale.
          </p>
        </div>
      </div>

      {/* Itemized By-Products Recorded Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Itemized Secondary Transactions</h3>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {byProductsList.length} items logged
          </span>
        </div>

        {byProductsList.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <p className="font-semibold text-slate-500">No by-product sales logged</p>
            <p className="text-[11px] text-slate-400 mt-1">Any secondary transactions recorded in POS or ledger will appear here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
            {byProductsList.map((item, idx) => (
              <div key={idx} className="py-3 px-2 flex items-center justify-between text-xs hover:bg-slate-50/80 rounded-xl transition">
                <div className="min-w-0 pr-3">
                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.quantity} {item.unit || 'unit'} &bull; Rate: Rs. {item.price || 0}
                  </p>
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
  );
}
