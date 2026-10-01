import React from 'react';
import { Package, HelpCircle, Layers, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProductStockFlowTable({
  products = [],
  openingSource = {},
  physicalCounts = {},
  onPhysicalCountChange,
  isClosed = false,
}) {
  const formatQty = (val, unit = '') => {
    const num = Number(val || 0);
    const formatted = num.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${formatted} ${unit}`;
  };

  const getSourceText = () => {
    if (openingSource?.type === 'PREVIOUS_CLOSING' && openingSource?.date) {
      return `Opening stock automatically retrieved from confirmed closing of ${openingSource.date}`;
    }
    if (openingSource?.type === 'MANUAL') {
      return 'Opening balances initialized from manual entry';
    }
    return 'No previous closing found (Starting from day 0 stock)';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Table Header / Title */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/30">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Inventory Reconciliation (Stock Flow)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Opening Stock</span> →{' '}
            <span className="font-semibold text-blue-700 dark:text-blue-400">Produced / Added</span> →{' '}
            <span className="font-semibold text-indigo-700 dark:text-indigo-400">Total Sold</span> →{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">Expected Closing</span>
          </p>
        </div>

        <div className="text-xs bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{getSourceText()}</span>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-3 text-right">Opening<br/><span className="text-[10px] font-normal text-slate-400">Start Stock</span></th>
              <th className="py-3 px-3 text-right">Produced / Added<br/><span className="text-[10px] font-normal text-slate-400">Farm + Supplier</span></th>
              <th className="py-3 px-3 text-right">Total Sold<br/><span className="text-[10px] font-normal text-slate-400">Counter + Delivery</span></th>
              <th className="py-3 px-3 text-right">Wastage<br/><span className="text-[10px] font-normal text-slate-400">Loss / Spoiled</span></th>
              <th className="py-3 px-3 text-right bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-900 dark:text-emerald-300">
                Closing Stock<br/><span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">Expected</span>
              </th>
              {!isClosed && (
                <th className="py-3 px-4 text-center">
                  Physical Count<br/><span className="text-[10px] font-normal text-slate-400">Actual Check</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.length === 0 ? (
              <tr>
                <td colSpan={isClosed ? 6 : 7} className="text-center py-8 text-slate-400 dark:text-slate-500 italic">
                  No catalog items found.
                </td>
              </tr>
            ) : (
              products.map((item, idx) => {
                const physicalVal = physicalCounts[item.productId] ?? '';
                const hasPhysical = physicalVal !== '' && !isNaN(Number(physicalVal));
                const diff = hasPhysical ? Number(physicalVal) - Number(item.expectedClosing) : 0;
                const isMismatch = hasPhysical && Math.abs(diff) > 0.01;

                return (
                  <tr
                    key={item.productId || idx}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      isMismatch ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{item.name}</span>
                        <span className="text-[11px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.unit || 'PIECE'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {formatQty(item.openingStock, item.unit)}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-blue-600 dark:text-blue-400">
                      {formatQty(item.produced, item.unit)}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-indigo-600 dark:text-indigo-400">
                      {formatQty(item.sold, item.unit)}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-rose-500 dark:text-rose-400">
                      {item.wasted > 0 ? formatQty(item.wasted, item.unit) : '0'}
                    </td>

                    <td className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {formatQty(item.expectedClosing, item.unit)}
                    </td>

                    {!isClosed && (
                      <td className="py-2 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Count"
                            value={physicalVal}
                            onChange={(e) => onPhysicalCountChange(item.productId, e.target.value)}
                            className={`w-24 h-8 px-2 text-center text-xs font-semibold rounded-lg border focus:outline-none focus:ring-2 ${
                              isMismatch
                                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 focus:ring-amber-500'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-emerald-500'
                            }`}
                          />
                          {isMismatch && (
                            <span
                              title={`Variance: ${diff > 0 ? '+' : ''}${diff} ${item.unit}`}
                              className="text-[11px] font-bold text-amber-600 dark:text-amber-400"
                            >
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          )}
                        </div>
                      </td>
                    )}
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
