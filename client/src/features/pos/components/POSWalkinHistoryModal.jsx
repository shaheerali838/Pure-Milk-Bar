import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Calendar,
  Phone,
  User,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePOSContext } from '@/context/POSContext';
import { getProductIcon } from '@/features/inventory/components/AddProduct';

export default function POSWalkinHistoryModal({ isOpen, onClose, initialSearch = '' }) {
  const { salesHistory = [], setCompletedSaleReceipt } = usePOSContext();
  const [dateFilter, setDateFilter] = useState(initialSearch ? 'all' : 'today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');

  // Sync initialSearch if passed or changed
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
      setDateFilter('all');
    }
  }, [initialSearch]);

  // Filter strictly Walk-in counter transactions only
  const walkinSales = useMemo(() => {
    return salesHistory.filter((sale) => {
      // Strictly exclude any delivery / doorstep / rider orders
      const isDelivery =
        sale.saleCategory === 'delivery' ||
        sale.fulfillmentType === 'DELIVERY' ||
        sale.fulfillmentType === 'DOORSTEP' ||
        sale.fulfillmentMode === 'doorstep' ||
        Boolean(sale.rider && (sale.rider.name || sale.rider.customName || sale.rider._id || sale.rider.id)) ||
        Boolean(sale.deliveryMeta && (sale.deliveryMeta.riderName || sale.deliveryMeta.dropAddress || sale.deliveryMeta.deliveryAddress || sale.deliveryMeta.riderId)) ||
        Boolean(sale.ontimeCustomer && (sale.ontimeCustomer.name || sale.ontimeCustomer.phone || sale.ontimeCustomer.area));

      if (isDelivery) return false;

      // Strictly include only walk-in counter transactions
      const isWalkin =
        sale.saleCategory === 'walkin' ||
        sale.fulfillmentType === 'COUNTER' ||
        sale.fulfillmentType === 'TAKEAWAY' ||
        sale.fulfillmentMode === 'counter';

      return isWalkin;
    });
  }, [salesHistory]);

  // Filter by selected date
  const filteredByDate = useMemo(() => {
    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    return walkinSales.filter((sale) => {
      const saleDateObj = new Date(sale.timestamp || sale.date);
      const saleDateStr = saleDateObj.toDateString();

      if (dateFilter === 'today') {
        return saleDateStr === todayStr;
      }
      if (dateFilter === 'yesterday') {
        return saleDateStr === yesterdayStr;
      }
      if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return saleDateObj >= weekAgo;
      }
      if (dateFilter === 'custom') {
        const sDate = saleDateObj.toISOString().split('T')[0];
        if (startDate && sDate < startDate) return false;
        if (endDate && sDate > endDate) return false;
        if (customDate && !startDate && !endDate) return sDate === customDate;
        return true;
      }
      return true; // 'all'
    });
  }, [walkinSales, dateFilter, customDate, startDate, endDate]);

  // Filter by search query
  const displayedSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredByDate;

    return (dateFilter === 'all' ? walkinSales : filteredByDate).filter((sale) => {
      const custName = String(
        sale.walkinCustomer?.name ||
          sale.customer?.name ||
          sale.activeCustomer?.name ||
          sale.customerNameSnapshot ||
          sale.customerName ||
          sale.walkinName ||
          ''
      ).toLowerCase();
      const custPhone = String(
        sale.walkinCustomer?.phone ||
          sale.customer?.phone ||
          sale.activeCustomer?.phone ||
          sale.customerPhoneSnapshot ||
          sale.customerPhone ||
          sale.walkinPhone ||
          ''
      ).toLowerCase();
      const invId = String(
        sale.invoiceId || sale.receiptNumber || sale.id || sale._id || ''
      ).toLowerCase();
      const hasItem = (sale.items || []).some((i) =>
        String(i.name || '').toLowerCase().includes(q)
      );

      return custName.includes(q) || custPhone.includes(q) || invId.includes(q) || hasItem;
    });
  }, [filteredByDate, walkinSales, dateFilter, searchQuery]);

  // Aggregate Metrics for Walk-in Sales
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = displayedSales.length;
    let totalMilkLiters = 0;
    let cowMilkLiters = 0;
    let buffaloMilkLiters = 0;
    let totalDahiKg = 0;
    let totalOtherItems = 0;

    displayedSales.forEach((sale) => {
      totalRevenue += Number(sale.netPayable || sale.grandTotal || sale.totalAmount || 0);

      const items = sale.items || [];
      items.forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const qty = Number(item.quantity) || 0;

        if (name.includes('cow') && name.includes('milk')) {
          cowMilkLiters += qty;
          totalMilkLiters += qty;
        } else if (name.includes('buffalo') && name.includes('milk')) {
          buffaloMilkLiters += qty;
          totalMilkLiters += qty;
        } else if (name.includes('milk') || name.includes('doodh') || name.includes('dod')) {
          totalMilkLiters += qty;
        } else if (name.includes('dahi') || name.includes('yogurt')) {
          totalDahiKg += qty;
        } else {
          totalOtherItems += qty;
        }
      });
    });

    return {
      totalRevenue,
      totalOrders,
      totalMilkLiters: Number(totalMilkLiters.toFixed(2)),
      cowMilkLiters: Number(cowMilkLiters.toFixed(2)),
      buffaloMilkLiters: Number(buffaloMilkLiters.toFixed(2)),
      totalDahiKg: Number(totalDahiKg.toFixed(2)),
      totalOtherItems,
    };
  }, [displayedSales]);

  const handlePrintSlip = (sale) => {
    if (setCompletedSaleReceipt) {
      setCompletedSaleReceipt(sale);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header (Sleek Dark with Emerald Touch) */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Walk-in Counter History
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {displayedSales.length} Orders
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition cursor-pointer border border-white/10"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Date Ribbon */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Date Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'custom', label: 'Custom Range' },
              { id: 'all', label: 'All History' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setDateFilter(tab.id);
                  if (tab.id !== 'custom') {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-semibold text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCustomDate('');
                }}
                className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCustomDate('');
                }}
                className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
              {(startDate || endDate || customDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCustomDate('');
                    setDateFilter('today');
                  }}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 w-full sm:w-60 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-200 transition-all shadow-2xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search customer, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Summary KPI Cards (Soft Tastefully Colorful Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Milk Liters Sold */}
            <div className="bg-linear-to-br from-blue-50/80 via-sky-50/30 to-white border border-blue-200/80 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Total Milk Sold
              </span>
              <div className="text-xl font-bold font-mono text-blue-950 mt-1">
                {stats.totalMilkLiters} <span className="text-xs font-semibold text-blue-600">Liters</span>
              </div>
              <div className="text-[10px] text-blue-700 font-medium mt-1 flex items-center justify-between border-t border-blue-100/80 pt-1">
                <span>Cow: {stats.cowMilkLiters} L</span>
                <span>Buffalo: {stats.buffaloMilkLiters} L</span>
              </div>
            </div>

            {/* Total Walk-in Buyers */}
            <div className="bg-linear-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200/80 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Walk-in Customers
              </span>
              <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
                {stats.totalOrders} <span className="text-xs font-semibold text-emerald-600">Orders</span>
              </div>
              <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                Counter checkouts
              </p>
            </div>

            {/* Total Dahi & Byproducts */}
            <div className="bg-linear-to-br from-amber-50/80 via-orange-50/30 to-white border border-amber-200/80 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Dahi &amp; Products
              </span>
              <div className="text-xl font-bold font-mono text-amber-950 mt-1">
                {stats.totalDahiKg} <span className="text-xs font-semibold text-amber-700">Kg</span>
              </div>
              <p className="text-[10px] text-amber-700 mt-1 font-medium">
                +{stats.totalOtherItems} other items
              </p>
            </div>

            {/* Total Walk-in Cash Collected */}
            <div className="bg-linear-to-br from-indigo-50/80 via-purple-50/30 to-white border border-indigo-200/80 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                Total Revenue
              </span>
              <div className="text-xl font-bold font-mono text-indigo-950 mt-1">
                Rs. {stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-indigo-700 mt-1 font-medium">
                Cash &amp; payments
              </p>
            </div>
          </div>

          {/* Detailed Sales History Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">
                  Transactions List ({displayedSales.length})
                </span>
              </div>
            </div>

            {displayedSales.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs text-slate-400">
                No walk-in sales found for this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Time &amp; Invoice</th>
                      <th className="py-2.5 px-3 font-semibold">Customer</th>
                      <th className="py-2.5 px-3 font-semibold">Items</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Payment</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total Bill</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedSales.map((sale, idx) => {
                      const customer =
                        sale.customer ||
                        sale.walkinCustomer || {
                          name: 'Walk-in Customer',
                          phone: '',
                        };
                      const items = sale.items || [];
                      const formattedTime =
                        sale.formattedTime ||
                        (sale.timestamp
                          ? new Date(sale.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : 'Recent');

                      const milkInTxn = items.reduce((acc, i) => {
                        const name = (i.name || '').toLowerCase();
                        if (name.includes('milk') || name.includes('doodh') || name.includes('dod')) {
                          return acc + (Number(i.quantity) || 0);
                        }
                        return acc;
                      }, 0);

                      return (
                        <tr key={sale.invoiceId || idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 align-top">
                            <div className="font-mono font-bold text-slate-800 text-xs">
                              {sale.invoiceId}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {formattedTime} · {sale.date || 'Today'}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 align-top">
                            <div className="font-semibold text-slate-800 text-xs">
                              {customer.name || 'Walk-in Customer'}
                            </div>
                            {customer.phone && customer.phone !== 'N/A' && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {customer.phone}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 align-top max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {items.map((item, itemIdx) => {
                                const isMilk = (item.name || '').toLowerCase().includes('milk') || (item.name || '').toLowerCase().includes('doodh');
                                const isDahi = (item.name || '').toLowerCase().includes('dahi') || (item.name || '').toLowerCase().includes('yogurt');
                                return (
                                  <div
                                    key={itemIdx}
                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                      isMilk
                                        ? 'bg-blue-50 text-blue-800 border-blue-200/70'
                                        : isDahi
                                        ? 'bg-amber-50 text-amber-800 border-amber-200/70'
                                        : 'bg-slate-100 text-slate-800 border-slate-200'
                                    }`}
                                  >
                                    {getProductIcon(item.name, { size: 12, className: isMilk ? 'text-blue-600' : isDahi ? 'text-amber-600' : 'text-slate-600' })}
                                    <span className="font-bold">{item.name}</span>
                                    <span className="text-slate-500 text-[10px]">
                                      ({item.quantity} {item.unit || ''})
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            {milkInTxn > 0 && (
                              <div className="text-[10px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Total Milk: {milkInTxn} Liters
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 align-top text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                (sale.paymentMethod || '').toLowerCase() === 'cash'
                                  ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-300/60'
                                  : 'bg-sky-100/80 text-sky-800 border border-sky-300/60'
                              }`}
                            >
                              {sale.paymentMethod || 'Cash'}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 align-top text-right font-mono font-bold text-emerald-700 text-xs">
                            Rs. {Number(sale.netPayable || sale.grandTotal || 0).toLocaleString()}
                          </td>

                          <td className="py-2.5 px-3 align-top text-center">
                            <button
                              type="button"
                              onClick={() => handlePrintSlip(sale)}
                              title="View & Print Slip"
                              className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-500">
            Total of <strong className="text-slate-800">{displayedSales.length}</strong> orders ·{' '}
            <strong className="text-emerald-700">{stats.totalMilkLiters} L</strong> milk sold
          </div>
          <Button
            type="button"
            onClick={onClose}
            size="sm"
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
