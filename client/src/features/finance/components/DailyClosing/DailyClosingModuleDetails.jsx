import React, { useState } from 'react';
import {
  Layers,
  Milk,
  Tractor,
  Utensils,
  ShoppingCart,
  Truck,
  BookOpen,
  Users,
  Receipt,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Fuel,
} from 'lucide-react';

export default function DailyClosingModuleDetails({ breakdown = {}, isClosed = false }) {
  const [activeTab, setActiveTab] = useState('yields');
  const [searchTerm, setSearchTerm] = useState('');

  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-PK')}`;
  const formatL = (val) => `${Number(val || 0).toFixed(1)} L`;
  const formatQty = (val, unit = '') => `${Number(val || 0).toFixed(1)} ${unit}`.trim();

  const yields = breakdown?.yields || { logs: [] };
  const procurement = breakdown?.procurement || { logs: [] };
  const processing = breakdown?.processing || { logs: [] };
  const orders = breakdown?.orders || { logs: [] };
  const deliveries = breakdown?.deliveries || { logs: [] };
  const khata = breakdown?.khata || { logs: [] };
  const staff = breakdown?.staff || { logs: [] };
  const expenses = breakdown?.expenses || { logs: [] };
  const fuel = breakdown?.fuel || { logs: [] };
  const wastage = breakdown?.wastage || { logs: [] };

  const tabs = [
    {
      id: 'yields',
      label: 'Farm Milking Yields',
      icon: Milk,
      count: yields.logs?.length || 0,
      badge: formatL(yields.totalYield || 0),
    },
    {
      id: 'procurement',
      label: 'Supplier Milk Intake',
      icon: Tractor,
      count: procurement.logs?.length || 0,
      badge: formatL(procurement.totalLiters || 0),
    },
    {
      id: 'processing',
      label: 'Value-Add Processing',
      icon: Utensils,
      count: processing.logs?.length || 0,
      badge: `${processing.batchesCount || 0} Batches`,
    },
    {
      id: 'orders',
      label: 'POS Counter Sales',
      icon: ShoppingCart,
      count: orders.logs?.length || 0,
      badge: formatRs(orders.grossRevenue || 0),
    },
    {
      id: 'deliveries',
      label: 'Doorstep Deliveries',
      icon: Truck,
      count: deliveries.logs?.length || 0,
      badge: formatL(deliveries.totalDeliveredMilk || 0),
    },
    {
      id: 'khata',
      label: 'Customer Khata Recovery',
      icon: BookOpen,
      count: khata.logs?.length || 0,
      badge: formatRs(khata.totalRecovered || 0),
    },
    {
      id: 'staff',
      label: 'Staff & Labor',
      icon: Users,
      count: staff.logs?.length || 0,
      badge: `${staff.activeStaffCount || 0} Active`,
    },
    {
      id: 'expenses',
      label: 'Operating Expenses',
      icon: Receipt,
      count: (expenses.logs?.length || 0) + (fuel.logs?.length || 0),
      badge: formatRs(expenses.total || 0),
    },
    {
      id: 'wastage',
      label: 'Wastage & Spoilage',
      icon: Trash2,
      count: wastage.logs?.length || 0,
      badge: formatL(wastage.totalMilkWastage || 0),
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Complete Software Module Breakdown (Audit Logs)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live itemized transaction records from all farm, supply, POS, delivery, khata, staff, and finance operations.
            </p>
          </div>
        </div>

        {/* Global Tab Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records in active tab..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1 p-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body Content */}
      <div className="p-4 sm:p-5">
        {/* 1. Farm Milking Yields */}
        {activeTab === 'yields' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Total Yield</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {formatL(yields.totalYield)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <span className="text-[11px] text-amber-700 dark:text-amber-300 block">Morning Shift</span>
                <span className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200">
                  {formatL(yields.morningYield)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 block">Evening Shift</span>
                <span className="text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-200">
                  {formatL(yields.eveningYield)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">Animals Milked</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  {yields.animalsMilkedCount || 0} Cattle
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Animal Tag</th>
                    <th className="py-2.5 px-3">Name / Type</th>
                    <th className="py-2.5 px-3">Milking Shift</th>
                    <th className="py-2.5 px-3 text-right">Yield (Liters)</th>
                    <th className="py-2.5 px-3">Operator</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {yields.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                        No milking yield logs recorded for this day.
                      </td>
                    </tr>
                  ) : (
                    yields.logs
                      ?.filter(
                        (l) =>
                          !searchTerm ||
                          l.tagNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.animalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.shift?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.operator?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {log.tagNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            {log.animalName} <span className="text-[10px] text-slate-400">({log.type})</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.shift === 'MORNING'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {log.shift}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                            {formatL(log.yieldLiters)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{log.operator}</td>
                          <td className="py-2.5 px-3 text-slate-400 text-xs italic">{log.notes || '—'}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Supplier Milk Intake */}
        {activeTab === 'procurement' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Total Procured</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {formatL(procurement.totalLiters)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                <span className="text-[11px] text-blue-700 dark:text-blue-300 block">Total Milk Bill</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-200">
                  {formatRs(procurement.totalBill)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">Cash Paid Today</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  {formatRs(procurement.totalPaid)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                <span className="text-[11px] text-rose-700 dark:text-rose-300 block">Supplier Due Balance</span>
                <span className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-200">
                  {formatRs(procurement.totalDue)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Batch / Code</th>
                    <th className="py-2.5 px-3">Supplier Name</th>
                    <th className="py-2.5 px-3 text-right">Liters</th>
                    <th className="py-2.5 px-2 text-center">Fat % / LR</th>
                    <th className="py-2.5 px-3 text-right">Rate / L</th>
                    <th className="py-2.5 px-3 text-right">Total Bill</th>
                    <th className="py-2.5 px-3 text-right">Paid Today</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {procurement.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-400 italic">
                        No supplier milk intake recorded for this day.
                      </td>
                    </tr>
                  ) : (
                    procurement.logs
                      ?.filter(
                        (p) =>
                          !searchTerm ||
                          p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {log.batchNumber || 'INTAKE'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                            {log.supplierName}
                            {log.supplierPhone && (
                              <span className="text-[10px] text-slate-400 block">{log.supplierPhone}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-600">
                            {formatL(log.quantityLiters)}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-500">
                            {log.fatPercentage}% / {log.lrReading}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                            Rs. {log.ratePerLiter}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                            {formatRs(log.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            {formatRs(log.amountPaid)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {log.paymentStatus || 'ACCEPTED'}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Value-Add Dairy Processing */}
        {activeTab === 'processing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Total Batches Run</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {processing.batchesCount || 0} Batches
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <span className="text-[11px] text-amber-700 dark:text-amber-300 block">Raw Milk Consumed</span>
                <span className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200">
                  {formatL(processing.totalMilkUsed)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">Status</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  Completed & Packed
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Batch Code</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-right">Milk Used</th>
                    <th className="py-2.5 px-3 text-right">Output Produced</th>
                    <th className="py-2.5 px-2 text-center">Stage</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {processing.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                        No processing batches recorded for this date.
                      </td>
                    </tr>
                  ) : (
                    processing.logs
                      ?.filter(
                        (b) =>
                          !searchTerm ||
                          b.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.batchCode?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((batch, idx) => (
                        <tr key={batch.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {batch.batchCode}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {batch.product}
                          </td>
                          <td className="py-2.5 px-3 text-right text-amber-600 font-medium">
                            {formatL(batch.milkUsedLiters)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            {formatQty(batch.outputQuantity, batch.outputUnit)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {batch.stage || batch.status || 'Completed'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-xs italic">{batch.notes || '—'}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. POS Counter Sales */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Total Receipts</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {orders.totalCount || 0} Orders
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">Cash Orders</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  {orders.cashOrdersCount || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                <span className="text-[11px] text-blue-700 dark:text-blue-300 block">Digital Online</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-200">
                  {orders.onlineOrdersCount || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                <span className="text-[11px] text-purple-700 dark:text-purple-300 block">Khata Credit</span>
                <span className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-200">
                  {orders.khataOrdersCount || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
                <span className="text-[11px] text-teal-700 dark:text-teal-300 block">Gross Sales Total</span>
                <span className="text-base sm:text-lg font-bold text-teal-900 dark:text-teal-200">
                  {formatRs(orders.grossRevenue)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Receipt #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Cashier</th>
                    <th className="py-2.5 px-2 text-center">Payment Method</th>
                    <th className="py-2.5 px-3">Items Purchased</th>
                    <th className="py-2.5 px-3 text-right">Order Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                        No orders recorded for this date.
                      </td>
                    </tr>
                  ) : (
                    orders.logs
                      ?.filter(
                        (o) =>
                          !searchTerm ||
                          o.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.itemsList?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((order, idx) => (
                        <tr key={order.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {order.receiptNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                            {order.customerName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-xs">{order.cashier}</td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.paymentMethod === 'CASH'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : order.paymentMethod === 'ONLINE'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : order.paymentMethod === 'KHATA'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate">
                            {order.itemsList || `${order.itemsCount} items`}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">
                            {formatRs(order.grandTotal)}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Doorstep Deliveries */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Total Delivered Milk</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {formatL(deliveries.totalDeliveredMilk)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">COD Cash Collected</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  {formatRs(deliveries.codCollected)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                <span className="text-[11px] text-blue-700 dark:text-blue-300 block">Digital Paid</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-200">
                  {formatRs(deliveries.onlinePaid)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                <span className="text-[11px] text-purple-700 dark:text-purple-300 block">Delivery Khata Due</span>
                <span className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-200">
                  {formatRs(deliveries.khataDue)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Run Code</th>
                    <th className="py-2.5 px-3">Route / Sector</th>
                    <th className="py-2.5 px-3">Rider</th>
                    <th className="py-2.5 px-3 text-right">Liters</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-2 text-center">Payment Mode</th>
                    <th className="py-2.5 px-3 text-right">Collected (COD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {deliveries.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400 italic">
                        No delivery runs recorded for this date.
                      </td>
                    </tr>
                  ) : (
                    deliveries.logs
                      ?.filter(
                        (d) =>
                          !searchTerm ||
                          d.runCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.riderName?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((run, idx) => (
                        <tr key={run.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {run.runCode}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{run.route}</td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{run.riderName}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-600">
                            {formatL(run.qtyLiters)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                run.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {run.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center text-xs font-semibold">{run.paymentMode}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            {formatRs(run.codAmountToCollect || run.amountPaid)}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Customer Khata Recovery */}
        {activeTab === 'khata' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Total Recovered</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {formatRs(khata.totalRecovered)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">Cash Recovery</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  {formatRs(khata.recoveredCash)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                <span className="text-[11px] text-blue-700 dark:text-blue-300 block">Digital Recovery</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-200">
                  {formatRs(khata.recoveredOnline)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                <span className="text-[11px] text-purple-700 dark:text-purple-300 block">Credit Given Today</span>
                <span className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-200">
                  {formatRs(khata.creditGiven)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-2 text-center">Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Debit (Added)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Paid)</th>
                    <th className="py-2.5 px-2 text-center">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {khata.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400 italic">
                        No customer khata transactions recorded today.
                      </td>
                    </tr>
                  ) : (
                    khata.logs
                      ?.filter(
                        (k) =>
                          !searchTerm ||
                          k.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          k.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          k.description?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((entry, idx) => (
                        <tr key={entry.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {entry.voucherNumber}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {entry.customerName}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                entry.transactionType === 'CREDIT'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {entry.transactionType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-xs">
                            {entry.description}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-rose-600">
                            {entry.debitAmount > 0 ? formatRs(entry.debitAmount) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            {entry.creditAmount > 0 ? formatRs(entry.creditAmount) : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-center text-xs font-semibold">{entry.paymentMethod}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Staff & Labor */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Staff on Duty</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {staff.activeStaffCount || 0} Staff Members
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                <span className="text-[11px] text-rose-700 dark:text-rose-300 block">Wages / Salaries Paid</span>
                <span className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-200">
                  {formatRs(staff.totalWagesPaid)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">Farm Labor Status</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  Active Shifts
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Staff Code</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Role / Designation</th>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Daily Salary Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staff.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                        No staff records found.
                      </td>
                    </tr>
                  ) : (
                    staff.logs
                      ?.filter(
                        (s) =>
                          !searchTerm ||
                          s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.staffCode?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((stf, idx) => (
                        <tr key={stf.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {stf.staffCode}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {stf.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{stf.role}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{stf.shift}</td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                stf.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {stf.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                            {formatRs(stf.dailySalary)}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. Operating Expenses & Fuel */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Total Daily Expenses</span>
                <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
                  {formatRs(expenses.total)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                <span className="text-[11px] text-rose-700 dark:text-rose-300 block">Drawer Cash Paid</span>
                <span className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-200">
                  {formatRs(expenses.cashTotal)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                <span className="text-[11px] text-blue-700 dark:text-blue-300 block">Digital / Online Expenses</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-200">
                  {formatRs(expenses.nonCashTotal)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Expense Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Authorized By</th>
                    <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                        No expense vouchers logged for this date.
                      </td>
                    </tr>
                  ) : (
                    expenses.logs
                      ?.filter(
                        (e) =>
                          !searchTerm ||
                          e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((exp, idx) => (
                        <tr key={exp.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {exp.voucherNumber}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {exp.title}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                            {exp.paymentMethod}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-xs">{exp.authorizedBy}</td>
                          <td className="py-2.5 px-3 text-right font-black text-rose-600">
                            {formatRs(exp.amount)}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Fuel Sub-logs if present */}
            {fuel.logs?.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-amber-500" />
                  Vehicle Fuel Logs
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <th className="py-2 px-3">Vehicle #</th>
                        <th className="py-2 px-3">Driver</th>
                        <th className="py-2 px-3 text-right">Liters</th>
                        <th className="py-2 px-3 text-right">Cost (PKR)</th>
                        <th className="py-2 px-3">Fuel Station</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuel.logs.map((f, idx) => (
                        <tr key={f.id || idx} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 px-3 font-semibold">{f.vehicleNumber}</td>
                          <td className="py-2 px-3">{f.driverName}</td>
                          <td className="py-2 px-3 text-right">{f.liters} L</td>
                          <td className="py-2 px-3 text-right font-bold text-rose-600">{formatRs(f.costRupees)}</td>
                          <td className="py-2 px-3 text-slate-400">{f.station}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. Wastage & Spoilage Logs */}
        {activeTab === 'wastage' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Total Milk Wasted</span>
                <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
                  {formatL(wastage.totalMilkWastage)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <span className="text-[11px] text-amber-700 dark:text-amber-300 block">Spoilage Entries</span>
                <span className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200">
                  {wastage.logs?.length || 0} Records
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">Account Status</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  Deducted from Inventory
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity Wasted</th>
                    <th className="py-2.5 px-2 text-center">Reason</th>
                    <th className="py-2.5 px-3">Logged By</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {wastage.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                        No wastage recorded for this date.
                      </td>
                    </tr>
                  ) : (
                    wastage.logs
                      ?.filter(
                        (w) =>
                          !searchTerm ||
                          w.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.reason?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {log.productName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{log.type}</td>
                          <td className="py-2.5 px-3 text-right font-black text-rose-600">
                            {formatQty(log.quantity, log.unit)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              {log.reason}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-xs">{log.recordedBy}</td>
                          <td className="py-2.5 px-3 text-slate-400 text-xs italic">{log.note || '—'}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
