import React, { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductProfitTable({ products = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-PK')}`;

  const totalRevenue = products.reduce((acc, p) => acc + (p.revenue || 0), 0);
  const totalCost = products.reduce((acc, p) => acc + (p.cost || 0), 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Header with expand/collapse */}
      <div
        className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Product-Wise Sales & Profit Breakdown
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                Gross Margin: {formatRs(totalProfit)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Units sold, revenue, COGS (unit cost), and gross product margin per line item
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Table */}
      {isOpen && (
        <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Revenue (Rs.)</th>
                <th className="py-2.5 px-3 text-right">Cost / COGS (Rs.)</th>
                <th className="py-2.5 px-4 text-right font-bold text-teal-800 dark:text-teal-300">Gross Profit (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                    No sales recorded for this period.
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={p.productId || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}
                      <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({p.unit || 'PIECE'})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                      {p.sold > 0 ? `${p.sold} ${p.unit || ''}` : '0'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatRs(p.revenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-500 dark:text-slate-400">
                      {formatRs(p.cost)}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-black ${p.profit >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-rose-600'}`}>
                      {formatRs(p.profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {products.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
                  <td className="py-3 px-4 text-slate-900 dark:text-white">Total</td>
                  <td className="py-3 px-3 text-right">
                    {products.reduce((acc, p) => acc + (p.sold || 0), 0)} units
                  </td>
                  <td className="py-3 px-3 text-right text-slate-900 dark:text-white">
                    {formatRs(totalRevenue)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                    {formatRs(totalCost)}
                  </td>
                  <td className="py-3 px-4 text-right text-teal-700 dark:text-teal-400 font-black">
                    {formatRs(totalProfit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
