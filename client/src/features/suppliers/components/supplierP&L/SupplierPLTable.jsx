import React, { useState, useMemo } from 'react';
import {
  Layers,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Droplets,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CATEGORY_FILTERS = [
  'All Categories',
  'Raw Sourced Milk',
  'Processed & Chilled',
  'Cream By-Products',
];

export default function SupplierPLTable({
  products = [],
  onSelectRow,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All Categories') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Table Header with Title and Dropdown Filter */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0092b8] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 font-display uppercase tracking-wider">
              Sourced Milk Lines &amp; Resale Channel Breakdown
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any line row to inspect channel distribution, base costs, and realization
            </p>
          </div>
        </div>

        {/* Category Dropdown Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-[#0092b8] focus:border-[#0092b8] transition cursor-pointer"
            >
              {CATEGORY_FILTERS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-3.5">Product Stream</th>
              <th className="py-2.5 px-3.5">Category</th>
              <th className="py-2.5 px-3.5 text-right">Sourced Volume</th>
              <th className="py-2.5 px-3.5 text-right">Resale Revenue</th>
              <th className="py-2.5 px-3.5 text-right">Gross Margin</th>
              <th className="py-2.5 px-3.5 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No sourced milk lines found in this category.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, idx) => {
                const categoryBadgeColor =
                  p.category === 'Raw Sourced Milk'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : p.category === 'Processed & Chilled'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr
                    key={p.id || idx}
                    onClick={() => onSelectRow && onSelectRow(p)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group select-none"
                  >
                    {/* 1. Product Stream */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0092b8] flex items-center justify-center font-bold shrink-0 border border-teal-100">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#0092b8] transition-colors">
                            {p.streamName}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{p.sourceType}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Category */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryBadgeColor}`}>
                        {p.category}
                      </span>
                    </td>

                    {/* 3. Sourced Volume */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <p className="font-bold font-mono text-slate-900">
                        {Number(p.sourcedVolume).toLocaleString()} {p.unit || 'L'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Base: Rs. {Number(p.baseCost).toLocaleString()}
                      </p>
                    </td>

                    {/* 4. Resale Revenue */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <p className="font-bold font-mono text-emerald-700">
                        Rs. {Number(p.resaleRevenue).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Avg Rs. {Number(p.avgResaleRate || 0).toFixed(1)}/{p.unit || 'L'}
                      </p>
                    </td>

                    {/* 5. Gross Margin */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <span className="font-bold font-mono text-slate-900 block">
                        +Rs. {Number(p.grossMargin).toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {p.grossMarginPercent}% Margin
                      </span>
                    </td>

                    {/* 6. Details */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRow && onSelectRow(p);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 bg-slate-100 group-hover:bg-[#0092b8] group-hover:text-white transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Breakdown</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
