import React, { useState } from 'react';
import {
  ArrowLeft,
  Droplets,
  Layers,
  Truck,
  Scale,
  DollarSign,
  Receipt,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  Milk,
  Wallet,
  Tag,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSSalesSourceDetail({ source = 'farm', onBack }) {
  const {
    farmSalesMetrics,
    supplierSalesMetrics,
    inventoryMetrics,
    salesHistory = [],
  } = usePOSContext();

  const [activeTab, setActiveTab] = useState(
    source === 'supplier' ? 'supplier' : source === 'all' ? 'all' : 'farm'
  );

  const isFarm = activeTab === 'farm';
  const isSupplier = activeTab === 'supplier';
  const isAll = activeTab === 'all';

  const currentMetrics = isSupplier ? supplierSalesMetrics : farmSalesMetrics;

  // Filter sales invoices for the active source
  const filteredSales = salesHistory.filter((sale) => {
    if (isAll) return true;
    return (sale.items || []).some((item) => {
      const itemSrc =
        item.source ||
        ((item.name &&
          (item.name.toLowerCase().includes('supplier') ||
            item.name.toLowerCase().includes('sourced') ||
            item.name.toLowerCase().includes('chilled'))) ||
        (item.category &&
          (item.category.toLowerCase().includes('supplier') ||
            item.category.toLowerCase().includes('sourced') ||
            item.category.toLowerCase().includes('chilled')))
          ? 'Supplier'
          : 'Farm');
      return itemSrc.toLowerCase() === activeTab.toLowerCase();
    });
  });

  // Calculate combined metrics if in 'all' comparison mode
  const totalRev = isAll
    ? farmSalesMetrics.totalRevenue + supplierSalesMetrics.totalRevenue
    : currentMetrics.totalRevenue;
  const totalCost = isAll
    ? farmSalesMetrics.totalCost + supplierSalesMetrics.totalCost
    : currentMetrics.totalCost;
  const totalGross = isAll
    ? farmSalesMetrics.grossProfit + supplierSalesMetrics.grossProfit
    : currentMetrics.grossProfit;
  const totalOverhead = isAll
    ? farmSalesMetrics.allocatedOverhead + supplierSalesMetrics.allocatedOverhead
    : currentMetrics.allocatedOverhead;
  const totalNet = isAll
    ? farmSalesMetrics.netProfit + supplierSalesMetrics.netProfit
    : currentMetrics.netProfit;
  const grossMarginPct = totalRev > 0 ? Math.round((totalGross / totalRev) * 100) : 0;
  const netMarginPct = totalRev > 0 ? Math.round((totalNet / totalRev) * 100) : 0;

  const totalMilkSold = isAll
    ? Number((farmSalesMetrics.milkSold + supplierSalesMetrics.milkSold).toFixed(1))
    : currentMetrics.milkSold;
  const totalDahiSold = isAll
    ? Number((farmSalesMetrics.dahiSold + supplierSalesMetrics.dahiSold).toFixed(1))
    : currentMetrics.dahiSold;

  const avgMilkRate =
    totalMilkSold > 0
      ? Math.round(
          (isAll
            ? farmSalesMetrics.milkRevenue + supplierSalesMetrics.milkRevenue
            : currentMetrics.milkRevenue) / totalMilkSold
        )
      : 0;

  const avgDahiRate =
    totalDahiSold > 0
      ? Math.round(
          (isAll
            ? farmSalesMetrics.dahiRevenue + supplierSalesMetrics.dahiRevenue
            : currentMetrics.dahiRevenue) / totalDahiSold
        )
      : 0;

  const baseUnitCost =
    totalMilkSold > 0
      ? Math.round(
          (isAll
            ? farmSalesMetrics.totalCost + supplierSalesMetrics.totalCost
            : currentMetrics.totalCost) / totalMilkSold
        )
      : 0;

  const realizationPerLiter =
    totalMilkSold > 0 ? Number((totalNet / totalMilkSold).toFixed(2)) : 0;

  const avatarColor = isSupplier
    ? 'bg-blue-100 border-blue-200 text-blue-800'
    : isFarm
    ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
    : 'bg-indigo-100 border-indigo-200 text-indigo-800';

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-10">
      {/* 1. Header & Source Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to POS
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              {isSupplier
                ? 'Supplier Milk Sales Details'
                : isFarm
                ? 'Farm Milk Sales Details'
                : 'All Milk & Dairy Sales Details'}
            </h1>
            <p className="text-xs text-slate-500">
              {isSupplier
                ? 'Milk bought from outside dairy suppliers'
                : isFarm
                ? 'Milk produced from our own farm cows & buffaloes'
                : 'Combined sales and profits from Farm & Suppliers'}
            </p>
          </div>
        </div>

        {/* Simple Source Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('farm')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
              isFarm
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farm Milk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supplier')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
              isSupplier
                ? 'bg-white text-blue-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Supplier Milk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
              isAll
                ? 'bg-white text-indigo-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>All Combined</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Cards (Card view - keep the cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Volume Sold */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Droplets className="w-4 h-4 text-blue-600" />
              Total Volume Sold
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
              Litres &amp; kg
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {totalMilkSold} <span className="text-sm font-bold text-slate-500">Liters</span>
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {totalMilkSold} L Milk • {totalDahiSold} kg Dahi Sold
          </p>
        </div>

        {/* Card 2: Total Sales (Income) */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Total Sales (Income)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
              Total Bill
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            Rs. {totalRev.toLocaleString()}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Cash, Online &amp; Counter sales
          </p>
        </div>

        {/* Card 3: Total Milk Cost */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-rose-700">
              <Receipt className="w-4 h-4 text-rose-600" />
              Total Milk Cost
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
              Expense
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            Rs. {totalCost.toLocaleString()}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {isSupplier ? 'Paid to dairy suppliers' : isFarm ? 'Farm feed & milking cost' : 'Sourcing & herd cost'}
          </p>
        </div>

        {/* Card 4: Net Profit (Bachat) */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              Net Profit (Bachat)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
              {netMarginPct}% Margin
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
            Rs. {totalNet.toLocaleString()}
          </p>
          <p className="text-xs font-bold text-emerald-800 mt-1">
            {totalMilkSold > 0 ? `Rs. ${realizationPerLiter} Profit per Liter` : 'Final Clean Profit'}
          </p>
        </div>
      </div>

      {/* 3. TABLE 1: Product Sales & Profit Breakdown (Table-wise) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Milk className="w-4 h-4 text-blue-600" />
              Product Sales &amp; Rates Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Details of every item sold with quantity, selling rate, cost, and profit earned.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {((isAll
              ? [
                  ...(farmSalesMetrics.itemizedProducts || []),
                  ...(supplierSalesMetrics.itemizedProducts || []),
                ]
              : currentMetrics.itemizedProducts) || []).length} Products Sold
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Product Name</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Source</th>
                <th className="py-3 px-3.5 text-right">Quantity Sold</th>
                <th className="py-3 px-3.5 text-right">Selling Rate</th>
                <th className="py-3 px-3.5 text-right">Cost Price</th>
                <th className="py-3 px-3.5 text-right">Total Income</th>
                <th className="py-3 px-3.5 text-right">Total Cost</th>
                <th className="py-3 px-3.5 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {((isAll
                ? [
                    ...(farmSalesMetrics.itemizedProducts || []),
                    ...(supplierSalesMetrics.itemizedProducts || []),
                  ]
                : currentMetrics.itemizedProducts) || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No sales recorded yet for this channel.
                  </td>
                </tr>
              ) : (
                ((isAll
                  ? [
                      ...(farmSalesMetrics.itemizedProducts || []),
                      ...(supplierSalesMetrics.itemizedProducts || []),
                    ]
                  : currentMetrics.itemizedProducts) || []).map((p, idx) => {
                  const pProfit = Number(p.totalRevenue - p.totalCost);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        {p.category || 'Milk'}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.source === 'Supplier'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.source === 'Supplier' ? 'Supplier' : 'Farm'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        {p.qtySold} {p.unit?.includes('liter') ? 'L' : 'kg'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-slate-700">
                        Rs. {p.avgRate}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-slate-500">
                        Rs. {p.unitCost || 0}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        Rs. {Number(p.totalRevenue).toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-rose-600 font-medium">
                        Rs. {Number(p.totalCost).toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">
                        +Rs. {pProfit.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. TABLE 2: Simple Income & Expense (P&L) Summary Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Income, Expense &amp; Profit Summary (P&amp;L)
            </h3>
            <p className="text-xs text-slate-500">
              Clear calculation of how the final net profit is calculated from sales and expenses.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            {netMarginPct}% Net Profit Margin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Step / Head</th>
                <th className="py-2.5 px-3.5">Description</th>
                <th className="py-2.5 px-3.5 text-right">Amount (Rs.)</th>
                <th className="py-2.5 px-3.5 text-right">Per Liter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1: Total Sales */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  Total Sales Income
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  Total revenue collected from counter customers and doorstep deliveries
                </td>
                <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                  + Rs. {totalRev.toLocaleString()}
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-slate-700">
                  {avgMilkRate > 0 ? `Rs. ${avgMilkRate} / L` : '—'}
                </td>
              </tr>

              {/* Row 2: Milk Cost */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3.5 font-bold text-rose-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  Milk Purchase / Feed Cost
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  {isSupplier
                    ? 'Actual purchase price paid for supplier milk intake'
                    : isFarm
                    ? 'Feed, fodder and direct milking cost for farm animals'
                    : 'Combined procurement cost and dairy herd costs'}
                </td>
                <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-600 text-sm">
                  - Rs. {totalCost.toLocaleString()}
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-rose-600">
                  {baseUnitCost > 0 ? `Rs. ${baseUnitCost} / L` : '—'}
                </td>
              </tr>

              {/* Row 3: Gross Profit */}
              <tr className="bg-blue-50/40 font-semibold text-blue-900">
                <td className="py-2.5 px-3.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-black">
                    3
                  </span>
                  Gross Profit (Sales minus Milk Cost)
                </td>
                <td className="py-2.5 px-3.5 text-blue-800 text-[11px]">
                  Profit before electricity, chilling, and shop overheads
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono font-black text-blue-800 text-sm">
                  = Rs. {totalGross.toLocaleString()}
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono font-bold text-blue-800">
                  {grossMarginPct}% Margin
                </td>
              </tr>

              {/* Row 4: Expenses */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3.5 font-bold text-amber-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">
                    4
                  </span>
                  Shop Expenses &amp; Chilling Overhead
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  Chiller cooling electricity, delivery fuel, bags and shop maintenance
                </td>
                <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-700 text-sm">
                  - Rs. {totalOverhead.toLocaleString()}
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-amber-700">
                  {totalMilkSold > 0 ? `Rs. ${(totalOverhead / totalMilkSold).toFixed(1)} / L` : '—'}
                </td>
              </tr>

              {/* Row 5: Final Net Profit */}
              <tr className="bg-emerald-100/70 border-t-2 border-emerald-300 font-extrabold text-emerald-950">
                <td className="py-3.5 px-3.5 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                    5
                  </span>
                  Final Clean Net Profit (Bachat)
                </td>
                <td className="py-3.5 px-3.5 text-xs text-emerald-900 font-medium">
                  Actual net profit in pocket after all costs and expenses
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono font-black text-emerald-800 text-base">
                  = Rs. {totalNet.toLocaleString()}
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono font-black text-emerald-800 text-sm">
                  {totalMilkSold > 0 ? `Rs. ${realizationPerLiter} / L` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TABLE 3: Recent Customer Receipts & Invoices */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Recent Sales Receipts &amp; Invoices
            </h3>
            <p className="text-xs text-slate-500">
              List of recent invoices with customer name, items bought, and bill amount.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {filteredSales.length} Invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Invoice #</th>
                <th className="py-3 px-3.5">Date &amp; Time</th>
                <th className="py-3 px-3.5">Customer Name</th>
                <th className="py-3 px-3.5">Items Purchased</th>
                <th className="py-3 px-3.5 text-center">Payment Type</th>
                <th className="py-3 px-3.5 text-right">Bill Amount</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No sales receipts recorded yet.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.invoiceId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-700">
                      {sale.invoiceId}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                      {sale.formattedDate || sale.date || 'Today'} &bull; {sale.formattedTime || '—'}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {sale.walkinName || (sale.customer && sale.customer.name) || 'Walk-in Customer'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate">
                      {(sale.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {sale.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-black text-slate-900 text-sm">
                      Rs. {Number(sale.netPayable || sale.subtotal).toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
