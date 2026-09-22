import React from 'react';
import {
  X,
  Building2,
  Truck,
  Store,
  Layers,
  ArrowUpRight,
  Droplets,
  DollarSign,
  TrendingUp,
  Percent,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ProductChannelBreakdown({ product, onClose }) {
  if (!product) return null;

  const categoryColor =
    product.category === 'Raw Sourced Milk'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : product.category === 'Processed & Chilled'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const sourceIconColor =
    product.sourceType === 'Bulk Intake Sourcing'
      ? 'bg-blue-100 text-blue-700'
      : product.sourceType === 'Cream Separation Intake'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Dark Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-over Right Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-slate-200 overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${sourceIconColor}`}>
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 font-display">
                  {product.streamName}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColor}`}>
                  {product.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Resale Channel Allocation &amp; Procurement Unit Economics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Section 1: Source & Procurement Base Cost */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                Procurement Origin &amp; Base Cost
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Source: <strong className="text-slate-900">{product.sourceType}</strong>
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Supply Origin:</span>
              </div>
              <span className="font-semibold text-slate-800">
                {product.originDetails || 'Local Collection Route / Direct Intake'}
              </span>
            </div>

            {/* 3 Metric Tiles */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Sourced Volume</p>
                <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                  {Number(product.sourcedVolume).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">{product.unit || 'L'}</span>
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Base Sourcing Cost</p>
                <p className="text-sm font-extrabold text-rose-600 font-mono mt-0.5">
                  Rs. {Number(product.baseCost).toLocaleString()}
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Avg Purchase Rate</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">
                  Rs. {product.avgPurchaseRate ? Number(product.avgPurchaseRate).toFixed(1) : '—'} <span className="text-[10px] font-normal text-slate-500">/{product.unit || 'L'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Distribution Across Selling Channels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Distribution Across Selling Channels
              </h4>
              <span className="text-[11px] text-slate-500">
                Resale Realization Breakdown
              </span>
            </div>

            <div className="space-y-2.5">
              {product.channels && product.channels.map((channel, idx) => {
                const icon =
                  channel.channelName.includes('Doorstep') ? (
                    <Truck className="w-4 h-4 text-purple-600" />
                  ) : channel.channelName.includes('POS') ? (
                    <Store className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Layers className="w-4 h-4 text-emerald-600" />
                  );

                const channelBg =
                  channel.channelName.includes('Doorstep')
                    ? 'border-purple-200/70 bg-purple-50/20'
                    : channel.channelName.includes('POS')
                    ? 'border-blue-200/70 bg-blue-50/20'
                    : 'border-emerald-200/70 bg-emerald-50/20';

                return (
                  <div
                    key={idx}
                    className={`border rounded-xl p-3.5 transition-all bg-white hover:shadow-xs ${channelBg}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                          {icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {channel.channelName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {channel.channelSubtext || 'Realized Commercial Resale Channel'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900 font-mono">
                          Rs. {Number(channel.revenue).toLocaleString()}
                        </span>
                        <p className="text-[10px] font-bold text-slate-500">
                          {channel.sharePercent}% Share
                        </p>
                      </div>
                    </div>

                    {/* Channel Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${
                          channel.channelName.includes('Doorstep')
                            ? 'bg-purple-600'
                            : channel.channelName.includes('POS')
                            ? 'bg-blue-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, channel.sharePercent))}%` }}
                      />
                    </div>

                    {/* Stats sub-row */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100/80 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Volume Sold:</span>
                        <strong className="text-slate-800 font-mono">
                          {Number(channel.volume).toLocaleString()} {product.unit || 'L'}
                        </strong>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-400 block text-[10px]">Avg Sale Rate:</span>
                        <strong className="text-slate-800 font-mono">
                          Rs. {Number(channel.avgRate).toFixed(1)}/{product.unit || 'L'}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Channel Gross:</span>
                        <strong className="text-emerald-700 font-mono">
                          +Rs. {Number(channel.grossMargin).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Allocated Logistics & Quality Testing */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                Allocated Logistics, Testing &amp; Transit Overheads:
              </span>
              <span className="font-bold text-slate-900 font-mono">
                Rs. {Number(product.allocatedOverhead || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Proportionately allocated from collection route fuel, chiller maintenance, and sulfuric lab testing expenses.
            </p>
          </div>

          {/* Section 4: Total Net Realized Gross Profit Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                Realized Trading P&amp;L Summary
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {product.grossMarginPercent}% Margin
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Resale Revenue:</span>
                <span className="font-mono font-bold text-white">
                  + Rs. {Number(product.resaleRevenue).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Less: Base Supplier Procurement Cost:</span>
                <span className="font-mono font-medium text-rose-300">
                  - Rs. {Number(product.baseCost).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Less: Sourcing Overhead Allocation:</span>
                <span className="font-mono font-medium text-amber-300">
                  - Rs. {Number(product.allocatedOverhead || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-300 block uppercase tracking-wider">
                  Total Net Realized Gross Profit
                </span>
                <p className="text-xs text-slate-400">After all direct supplier &amp; transit costs</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  Rs. {Number(product.netProfit).toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-300 font-mono">
                  (Rs. {product.realizationPerUnit ? Number(product.realizationPerUnit).toFixed(1) : '0.0'}/{product.unit || 'L'} net)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
