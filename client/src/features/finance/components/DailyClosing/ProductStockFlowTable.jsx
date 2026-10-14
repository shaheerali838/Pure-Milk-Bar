import React from 'react';
import { Package, HelpCircle, Layers, CheckCircle, AlertCircle, Truck, Milk } from 'lucide-react';

export default function ProductStockFlowTable({
  products = [],
  supplierMilkFlow = null,
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

  const showSupplierStrip = supplierMilkFlow && (
    Number(supplierMilkFlow.totalPurchased || 0) > 0 ||
    Number(supplierMilkFlow.totalSold || 0) > 0
  );

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

      {/* Supplier Milk Sourcing & Sales Reconciliation Banner */}
      {showSupplierStrip && (
        <div className="mx-4 my-3 sm:mx-5 sm:my-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-blue-50/50 dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-blue-950/20 border border-purple-200/70 dark:border-purple-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Supplier Milk Sourcing & Sales
                  <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                    Supplier Module Flow
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Purchased milk from suppliers vs dispatched & sold in today's business
                </p>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              <div className="bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-lg border border-purple-100 dark:border-purple-900/40 shadow-xs">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Milk Purchased</span>
                <span className="text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300 block">
                  {formatQty(supplierMilkFlow.totalPurchased, 'L')}
                </span>
                {(supplierMilkFlow.buffPurchased > 0 || supplierMilkFlow.cowPurchased > 0) && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {supplierMilkFlow.buffPurchased > 0 ? `Buff: ${supplierMilkFlow.buffPurchased}L` : ''}
                    {supplierMilkFlow.buffPurchased > 0 && supplierMilkFlow.cowPurchased > 0 ? ' · ' : ''}
                    {supplierMilkFlow.cowPurchased > 0 ? `Cow: ${supplierMilkFlow.cowPurchased}L` : ''}
                  </span>
                )}
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Supplier Milk Sold</span>
                <span className="text-xs sm:text-sm font-black text-indigo-700 dark:text-indigo-300 block">
                  {formatQty(supplierMilkFlow.totalSold, 'L')}
                </span>
                <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 block">
                  Dispatched Out
                </span>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Stock In Tank</span>
                <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300 block">
                  {formatQty(supplierMilkFlow.remainingStock, 'L')}
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">
                  Cold storage
                </span>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Procurement Bill</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 block">
                  Rs. {Number(supplierMilkFlow.totalBill || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  Paid: Rs. {Number(supplierMilkFlow.cashPaid || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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

                const hasProducedBreakdown = (Number(item.farmProduced || 0) > 0 || Number(item.supplierPurchased || 0) > 0);
                const hasSoldBreakdown = (Number(item.farmSold || 0) > 0 || Number(item.supplierSold || 0) > 0);

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
                      <div className="font-bold">
                        {formatQty(item.produced, item.unit)}
                      </div>
                      {hasProducedBreakdown && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-end gap-1.5 font-medium">
                          <span className="text-emerald-700 dark:text-emerald-400" title="Farm Produced">
                            Farm: {item.farmProduced}L
                          </span>
                          <span>•</span>
                          <span className="text-purple-700 dark:text-purple-400" title="Supplier Purchased">
                            Sup: {item.supplierPurchased}L
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-indigo-600 dark:text-indigo-400">
                      <div className="font-bold">
                        {formatQty(item.sold, item.unit)}
                      </div>
                      {hasSoldBreakdown && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-end gap-1.5 font-medium">
                          <span className="text-emerald-700 dark:text-emerald-400" title="Sold from Farm Milk">
                            Farm: {item.farmSold}L
                          </span>
                          <span>•</span>
                          <span className="text-purple-700 dark:text-purple-400" title="Sold from Supplier Milk">
                            Sup: {item.supplierSold}L
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-rose-500 dark:text-rose-400">
                      {item.wasted > 0 ? formatQty(item.wasted, item.unit) : '0'}
                    </td>

                    <td className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <div className="text-sm">
                        {formatQty(item.expectedClosing, item.unit)}
                      </div>
                      <div className="text-[10px] font-normal text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                        {item.expectedClosing < 0 ? 'Negative Stock' : 'In Cold Room'}
                      </div>
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
