import React, { useState } from 'react';
import {
  X,
  Droplets,
  Layers,
  TrendingUp,
  Scale,
  DollarSign,
  Receipt,
  Truck,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ShoppingBag,
  Store,
  User,
  Milk,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSSalesSourcePLModal({ source = 'farm', onClose }) {
  const {
    farmSalesMetrics,
    supplierSalesMetrics,
    inventoryMetrics,
    salesHistory = [],
  } = usePOSContext();

  const [activeTab, setActiveTab] = useState(source === 'supplier' ? 'supplier' : source === 'all' ? 'all' : 'farm');

  const isFarm = activeTab === 'farm';
  const isSupplier = activeTab === 'supplier';
  const isAll = activeTab === 'all';

  const currentMetrics = isSupplier ? supplierSalesMetrics : farmSalesMetrics;

  // Filter sales invoices for the active source
  const filteredSales = salesHistory.filter((sale) => {
    if (isAll) return true;
    return (sale.items || []).some((item) => {
      const itemSrc = item.source || (
        (item.name && (item.name.toLowerCase().includes('supplier') || item.name.toLowerCase().includes('sourced') || item.name.toLowerCase().includes('chilled'))) ||
        (item.category && (item.category.toLowerCase().includes('supplier') || item.category.toLowerCase().includes('sourced') || item.category.toLowerCase().includes('chilled')))
          ? 'Supplier'
          : 'Farm'
      );
      return itemSrc.toLowerCase() === activeTab.toLowerCase();
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Dark Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-over Right Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-slate-200 overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${
                  isSupplier
                    ? 'bg-blue-100 text-blue-700'
                    : isFarm
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {isSupplier ? <Truck className="w-5 h-5" /> : isFarm ? <Droplets className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 font-display">
                    {isSupplier
                      ? 'Supplier Milk Sales & P&L'
                      : isFarm
                      ? 'Farm Milk Sales & P&L'
                      : 'Farm vs Supplier Sales P&L Comparison'}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSupplier
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : isFarm
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {isSupplier ? 'Procured Sourcing' : isFarm ? 'In-House Herd' : 'Comprehensive'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Liters &amp; Dahi Volume Breakdown, Unit Economics &amp; Realized Net Profit
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

          {/* Source Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('farm')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                isFarm
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-emerald-600" />
              <span>Farm Dairy ({farmSalesMetrics.milkSold} L • {farmSalesMetrics.dahiSold} kg)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('supplier')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                isSupplier
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Supplier Sourced ({supplierSalesMetrics.milkSold} L • {supplierSalesMetrics.dahiSold} kg)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                isAll
                  ? 'bg-white text-indigo-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>Comparison</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Main Hero Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isAll ? 'Total Combined POS Dairy Revenue' : `${currentMetrics.label} Total Revenue`}
              </span>
              <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                Rs. {Number(isAll ? farmSalesMetrics.totalRevenue + supplierSalesMetrics.totalRevenue : currentMetrics.totalRevenue).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isAll
                  ? `${(farmSalesMetrics.milkSold + supplierSalesMetrics.milkSold).toFixed(1)} L Milk • ${(farmSalesMetrics.dahiSold + supplierSalesMetrics.dahiSold).toFixed(1)} kg Dahi Total Sold`
                  : `${currentMetrics.milkSold} L Milk • ${currentMetrics.dahiSold} kg Dahi Sold`}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Net Profit
              </span>
              <p className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                Rs. {Number(isAll ? farmSalesMetrics.netProfit + supplierSalesMetrics.netProfit : currentMetrics.netProfit).toLocaleString()}
              </p>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mt-1">
                {isAll
                  ? `${Math.round(((farmSalesMetrics.netProfit + supplierSalesMetrics.netProfit) / (farmSalesMetrics.totalRevenue + supplierSalesMetrics.totalRevenue || 1)) * 100)}% Net Margin`
                  : `${currentMetrics.netMarginPercent}% Net Margin`}
              </span>
            </div>
          </div>

          {/* Volume Breakdown: How many liters of milk and dahi sold */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Volume Sold Breakdown (Milk vs Dahi)
              </h4>
              <span className="text-[10px] font-bold text-slate-500">
                Source: {isAll ? 'Farm & Supplier' : currentMetrics.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Milk Card */}
              <div className="bg-white border border-blue-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      Milk Sold
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Liquid Volume
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 font-mono">
                    {isAll
                      ? (farmSalesMetrics.milkSold + supplierSalesMetrics.milkSold).toFixed(1)
                      : currentMetrics.milkSold}{' '}
                    <span className="text-sm font-semibold text-slate-500">Liters</span>
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 font-mono mt-1">
                    Rs. {Number(isAll ? farmSalesMetrics.milkRevenue + supplierSalesMetrics.milkRevenue : currentMetrics.milkRevenue).toLocaleString()} Revenue
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Avg Resale Rate:</span>
                  <strong className="text-slate-800 font-mono">
                    Rs. {isAll
                      ? Math.round((farmSalesMetrics.milkRevenue + supplierSalesMetrics.milkRevenue) / (farmSalesMetrics.milkSold + supplierSalesMetrics.milkSold || 1))
                      : Math.round(currentMetrics.milkRevenue / (currentMetrics.milkSold || 1))}/L
                  </strong>
                </div>
              </div>

              {/* Dahi Card */}
              <div className="bg-white border border-amber-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <Layers className="w-4 h-4 text-amber-600" />
                      Dahi Sold
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Cultured Yogurt
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 font-mono">
                    {isAll
                      ? (farmSalesMetrics.dahiSold + supplierSalesMetrics.dahiSold).toFixed(1)
                      : currentMetrics.dahiSold}{' '}
                    <span className="text-sm font-semibold text-slate-500">kg</span>
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 font-mono mt-1">
                    Rs. {Number(isAll ? farmSalesMetrics.dahiRevenue + supplierSalesMetrics.dahiRevenue : currentMetrics.dahiRevenue).toLocaleString()} Revenue
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Avg Resale Rate:</span>
                  <strong className="text-slate-800 font-mono">
                    Rs. {isAll
                      ? Math.round((farmSalesMetrics.dahiRevenue + supplierSalesMetrics.dahiRevenue) / (farmSalesMetrics.dahiSold + supplierSalesMetrics.dahiSold || 1))
                      : Math.round(currentMetrics.dahiRevenue / (currentMetrics.dahiSold || 1))}/kg
                  </strong>
                </div>
              </div>
            </div>

            {/* If in Comparison tab: Show Farm vs Supplier Volume Breakdown */}
            {isAll && (
              <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 mt-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Source-Wise Volume Distribution
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">Farm In-House</p>
                    <p className="font-extrabold text-slate-900 font-mono mt-0.5">
                      {farmSalesMetrics.milkSold} L Milk • {farmSalesMetrics.dahiSold} kg Dahi
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      Rs. {farmSalesMetrics.totalRevenue.toLocaleString()} Revenue
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-800 uppercase">Supplier Procured</p>
                    <p className="font-extrabold text-slate-900 font-mono mt-0.5">
                      {supplierSalesMetrics.milkSold} L Milk • {supplierSalesMetrics.dahiSold} kg Dahi
                    </p>
                    <p className="text-[10px] text-blue-700 mt-0.5">
                      Rs. {supplierSalesMetrics.totalRevenue.toLocaleString()} Revenue
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profit & Loss (P&L) Waterfall */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Profit &amp; Loss (P&amp;L) Financial Statement
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {isAll ? 'Consolidated P&L' : `${currentMetrics.label} P&L`}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-700">1. Total Realized Sales Revenue</span>
                <span className="font-mono font-bold text-emerald-700">
                  + Rs. {Number(isAll ? farmSalesMetrics.totalRevenue + supplierSalesMetrics.totalRevenue : currentMetrics.totalRevenue).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200 text-rose-600">
                <span>
                  2. Less: {isSupplier ? 'Direct Supplier Intake Purchase Spend' : isFarm ? 'Farm Feed, Fodder & Milking Cost' : 'Production & Procurement Cost (COGS)'}
                </span>
                <span className="font-mono font-bold">
                  - Rs. {Number(isAll ? farmSalesMetrics.totalCost + supplierSalesMetrics.totalCost : currentMetrics.totalCost).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200 bg-blue-50/60 px-2 rounded font-bold text-blue-900">
                <span>3. Gross Profit Margin</span>
                <span className="font-mono">
                  = Rs. {Number(isAll ? farmSalesMetrics.grossProfit + supplierSalesMetrics.grossProfit : currentMetrics.grossProfit).toLocaleString()} ({isAll ? Math.round(((farmSalesMetrics.grossProfit + supplierSalesMetrics.grossProfit) / (farmSalesMetrics.totalRevenue + supplierSalesMetrics.totalRevenue || 1)) * 100) : currentMetrics.grossMarginPercent}%)
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200 text-amber-700">
                <span>
                  4. Less: {isSupplier ? 'Collection Transit Fuel, Chilling & Lab Testing' : isFarm ? 'Farm Utilities, Shed Power & Herd Care' : 'Operating Overheads & Logistics'}
                </span>
                <span className="font-mono">
                  - Rs. {Number(isAll ? farmSalesMetrics.allocatedOverhead + supplierSalesMetrics.allocatedOverhead : currentMetrics.allocatedOverhead).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t-2 border-slate-800 font-extrabold text-sm text-slate-900 bg-emerald-50/70 p-2.5 rounded-lg">
                <div>
                  <span className="block">Net Bottom-Line Profit</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    Realization: Rs. {isAll ? Number(((farmSalesMetrics.netProfit + supplierSalesMetrics.netProfit) / (farmSalesMetrics.milkSold + supplierSalesMetrics.milkSold || 1)).toFixed(2)) : currentMetrics.realizationPerLiter} / Liter
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-700 text-base">
                    Rs. {Number(isAll ? farmSalesMetrics.netProfit + supplierSalesMetrics.netProfit : currentMetrics.netProfit).toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-semibold text-emerald-800">
                    ({isAll ? Math.round(((farmSalesMetrics.netProfit + supplierSalesMetrics.netProfit) / (farmSalesMetrics.totalRevenue + supplierSalesMetrics.totalRevenue || 1)) * 100) : currentMetrics.netMarginPercent}% Net Margin)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Products Sold Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
              Itemized Products Sales Ledger
            </h4>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2 px-2.5">Product Name</th>
                    <th className="py-2 px-2.5">Source</th>
                    <th className="py-2 px-2.5 text-right">Qty Sold</th>
                    <th className="py-2 px-2.5 text-right">Resale Rate</th>
                    <th className="py-2 px-2.5 text-right">Revenue</th>
                    <th className="py-2 px-2.5 text-right">Gross Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((isAll
                    ? [...(farmSalesMetrics.itemizedProducts || []), ...(supplierSalesMetrics.itemizedProducts || [])]
                    : currentMetrics.itemizedProducts) || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400 text-xs">
                        No sales recorded yet for this source.
                      </td>
                    </tr>
                  ) : (
                    ((isAll
                      ? [...(farmSalesMetrics.itemizedProducts || []), ...(supplierSalesMetrics.itemizedProducts || [])]
                      : currentMetrics.itemizedProducts) || []).map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">
                          {p.name}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              p.source === 'Supplier'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {p.source === 'Supplier' ? 'Supplier' : 'Farm'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-slate-800">
                          {p.qtySold} {p.unit?.includes('liter') ? 'L' : 'kg'}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">
                          Rs. {p.avgRate}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-900">
                          Rs. {Number(p.totalRevenue).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono font-bold text-emerald-700">
                          +Rs. {Number(p.totalRevenue - p.totalCost).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sales Invoices for this source */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
              Recent Sales Receipts ({filteredSales.length})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredSales.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent transactions recorded.</p>
              ) : (
                filteredSales.slice(0, 8).map((sale) => (
                  <div
                    key={sale.invoiceId}
                    className="p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{sale.invoiceId}</span>
                        <span className="text-[10px] text-slate-400">&bull; {sale.formattedDate || sale.date} {sale.formattedTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sale.walkinName || (sale.customer && sale.customer.name) || 'POS Counter Customer'} &bull;{' '}
                        {(sale.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        Rs. {Number(sale.netPayable || sale.subtotal).toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                        {sale.paymentMethod || 'Cash'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Real-time calculations from POS Register &amp; Procurement Intake
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
