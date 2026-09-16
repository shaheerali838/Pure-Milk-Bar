import React, { useState, useMemo } from 'react';
import { Filter, ArrowUpRight, ChevronRight, Droplets, Layers, Sparkles, Store, Truck } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'All Categories',
  'Raw Milk',
  'Value-Added',
];

export default function ProductRevenueBreakdown({ productsData = [], onSelectProduct }) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  // Filter products by dropdown category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All Categories') return productsData;
    return productsData.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      if (selectedCategory === 'Raw Milk') return cat.includes('raw') || cat.includes('milk');
      if (selectedCategory === 'Value-Added') return cat.includes('value') || cat.includes('processed') || cat.includes('dahi');
      return true;
    });
  }, [productsData, selectedCategory]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Header Row: Left Title, Right Select Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Farm Products Revenue &amp; Selling Channel Breakdown
          </h2>
          
        </div>

        {/* Right <select> Dropdown Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-3">Product Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-center">Total Output</th>
              <th className="py-3 px-3 text-right">Selling Rate</th>
              <th className="py-3 px-3 text-right">Gross Realized</th>
              <th className="py-3 px-3 text-right">Net Profit (Margin)</th>
              <th className="py-3 px-3 text-center">Channel Split</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400 text-xs">
                  No farm products found under this category filter.
                </td>
              </tr>
            ) : (
              filteredProducts.map((item, idx) => {
                const isProfitable = (item.netProfit || 0) >= 0;
                const pName = (item.name || '').toLowerCase();
                const iconEmoji = pName.includes('cow') ? '🐄'
                  : pName.includes('buffalo') ? '🐃'
                  : pName.includes('dahi') ? '🥣'
                  : '🥛';

                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectProduct && onSelectProduct(item)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    title={`Click to view ${item.name} channels and specifications`}
                  >
                    {/* Product Name */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-sm">
                          {iconEmoji}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {item.sku || `PRD-${String(idx + 1).padStart(3, '0')}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                        {item.category}
                      </span>
                    </td>

                    {/* Total Output */}
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800 tabular">
                      {Number(item.totalOutput || 0).toFixed(1)} <span className="text-[10px] font-medium text-slate-400">{item.unit || 'L'}</span>
                    </td>

                    {/* Selling Rate */}
                    <td className="py-3.5 px-3 text-right font-medium text-slate-600 tabular">
                      Rs. {item.sellingRate || 0}
                    </td>

                    {/* Gross Realized */}
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 tabular">
                      {fmt(item.grossRealized || 0)}
                    </td>

                    {/* Net Profit (Margin) */}
                    <td className="py-3.5 px-3 text-right tabular">
                      <span className={`font-bold ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fmt(item.netProfit || 0)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {item.netMargin || 0}% margin
                      </span>
                    </td>

                    {/* Channel Split (Doorstep, POS, Wholesale) */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[10px]">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60" title={`Doorstep: ${item.channelSplit?.doorstep?.share || 0}%`}>
                          D: {item.channelSplit?.doorstep?.share || 0}%
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200/60" title={`POS: ${item.channelSplit?.pos?.share || 0}%`}>
                          P: {item.channelSplit?.pos?.share || 0}%
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200/60" title={`Wholesale: ${item.channelSplit?.wholesale?.share || 0}%`}>
                          W: {item.channelSplit?.wholesale?.share || 0}%
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-800 transition">
                        Detail <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span>Click any product row to view detailed 3-channel split and profit analysis</span>
        <span>{filteredProducts.length} Farm Products Listed</span>
      </div>
    </div>
  );
}
