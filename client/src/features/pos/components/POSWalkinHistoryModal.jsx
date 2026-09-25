import React, { useState, useMemo } from 'react';
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

export default function POSWalkinHistoryModal({ isOpen, onClose }) {
  const { salesHistory = [], setCompletedSaleReceipt } = usePOSContext();
  const [dateFilter, setDateFilter] = useState('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only Walk-in counter transactions
  const walkinSales = useMemo(() => {
    return salesHistory.filter((sale) => {
      const isWalkin =
        sale.saleCategory === 'walkin' ||
        sale.fulfillmentType === 'COUNTER' ||
        sale.fulfillmentMode === 'counter' ||
        !sale.saleCategory;
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
        return saleDateObj.toISOString().split('T')[0] === customDate;
      }
      return true; // 'all'
    });
  }, [walkinSales, dateFilter, customDate]);

  // Filter by search query
  const displayedSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredByDate;

    return filteredByDate.filter((sale) => {
      const custName = String(sale.walkinCustomer?.name || sale.customer?.name || '').toLowerCase();
      const custPhone = String(sale.walkinCustomer?.phone || sale.customer?.phone || '').toLowerCase();
      const invId = String(sale.invoiceId || '').toLowerCase();
      const hasItem = (sale.items || []).some((i) =>
        String(i.name || '').toLowerCase().includes(q)
      );

      return custName.includes(q) || custPhone.includes(q) || invId.includes(q) || hasItem;
    });
  }, [filteredByDate, searchQuery]);

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
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shadow-inner">
              🥛
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-display text-white">
                  Walk-in Counter History &amp; Daily Milk Sales
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  {displayedSales.length} Walk-in Orders
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live register history of all walk-in customers who bought milk and dairy products.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer border border-white/15"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filter and Date Ribbon */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Date Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {[
              { id: 'today', label: 'Today (آج)' },
              { id: 'yesterday', label: 'Yesterday (کل)' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'custom', label: 'Custom Date' },
              { id: 'all', label: 'All History' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
          )}

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 w-full sm:w-64 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-2xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search customer, phone, milk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Summary KPI Cards for Walk-in Sales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Milk Liters Sold */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block flex items-center gap-1">
                <span>🥛</span> Total Milk Sold (دودھ)
              </span>
              <div className="text-2xl font-black font-mono text-blue-950 mt-1">
                {stats.totalMilkLiters} <span className="text-sm font-bold text-blue-700">Liters</span>
              </div>
              <div className="text-[10px] text-blue-700 font-semibold mt-1 flex items-center justify-between border-t border-blue-200/60 pt-1">
                <span>Cow: {stats.cowMilkLiters} L</span>
                <span>Buffalo: {stats.buffaloMilkLiters} L</span>
              </div>
            </div>

            {/* Total Walk-in Buyers */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block flex items-center gap-1">
                <span>👥</span> Walk-in Customers
              </span>
              <div className="text-2xl font-black font-mono text-emerald-950 mt-1">
                {stats.totalOrders} <span className="text-sm font-bold text-emerald-700">Buyers</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">
                Direct Counter Purchases
              </p>
            </div>

            {/* Total Dahi & Byproducts */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block flex items-center gap-1">
                <span>🥣</span> Dahi &amp; Byproducts
              </span>
              <div className="text-2xl font-black font-mono text-amber-950 mt-1">
                {stats.totalDahiKg} <span className="text-sm font-bold text-amber-700">Kg</span>
              </div>
              <p className="text-[10px] text-amber-700 font-medium mt-1">
                +{stats.totalOtherItems} other dairy items
              </p>
            </div>

            {/* Total Walk-in Cash Collected */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block flex items-center gap-1">
                <span>💵</span> Total Counter Revenue
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                Rs. {stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-300 font-medium mt-1">
                Cash &amp; Instant Payments
              </p>
            </div>
          </div>

          {/* Detailed Sales History Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800 font-display">
                  Walk-in Transactions Record ({displayedSales.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Sorted by latest purchase
              </span>
            </div>

            {displayedSales.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/30">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl mb-2">
                  🥛
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Walk-in Sales Found</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  No counter sales recorded for the selected date filter ({dateFilter}).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/75 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Time &amp; Invoice</th>
                      <th className="py-2.5 px-3 font-bold">Customer Name</th>
                      <th className="py-2.5 px-3 font-bold">Items &amp; Milk Bought</th>
                      <th className="py-2.5 px-3 font-bold text-center">Payment Mode</th>
                      <th className="py-2.5 px-3 font-bold text-right">Total Bill (Rs.)</th>
                      <th className="py-2.5 px-3 font-bold text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedSales.map((sale, idx) => {
                      const customer =
                        sale.customer ||
                        sale.walkinCustomer || {
                          name: 'Walk-in Guest',
                          phone: 'N/A',
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

                      // Calculate milk in this transaction
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
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {sale.invoiceId}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formattedTime} · {sale.date || 'Today'}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 align-top">
                            <div className="font-bold text-slate-800 text-xs">
                              {customer.name || 'Walk-in Customer'}
                            </div>
                            {customer.phone && customer.phone !== 'N/A' && (
                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                {customer.phone}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 align-top max-w-xs">
                            <div className="space-y-1">
                              {items.map((item, itemIdx) => (
                                <div
                                  key={itemIdx}
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium mr-1.5 mb-1"
                                >
                                  <span>{item.name?.toLowerCase().includes('dahi') ? '🥣' : '🥛'}</span>
                                  <span className="font-bold">{item.name}</span>
                                  <span className="text-slate-500">
                                    {item.quantity} {item.unit || ''}
                                  </span>
                                  <span className="text-slate-400">(@Rs. {item.price || item.unitPrice})</span>
                                </div>
                              ))}
                            </div>
                            {milkInTxn > 0 && (
                              <div className="text-[10px] font-bold text-blue-700 mt-1">
                                🥛 Total Milk: {milkInTxn} Liters
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 align-top text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                (sale.paymentMethod || '').toLowerCase() === 'cash'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : (sale.paymentMethod || '').toLowerCase() === 'online'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {sale.paymentMethod || 'Cash'}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 align-top text-right font-mono font-black text-slate-900 text-sm">
                            Rs. {Number(sale.netPayable || sale.grandTotal || 0).toLocaleString()}
                          </td>

                          <td className="py-2.5 px-3 align-top text-center">
                            <button
                              type="button"
                              onClick={() => handlePrintSlip(sale)}
                              title="View & Print Slip"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition cursor-pointer"
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
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="text-xs text-slate-500">
            Total of <strong className="text-slate-900">{displayedSales.length}</strong> walk-in transactions ·{' '}
            <strong className="text-blue-700">{stats.totalMilkLiters} L</strong> milk sold.
          </div>
          <Button
            type="button"
            onClick={onClose}
            size="sm"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
          >
            Close Window
          </Button>
        </div>
      </div>
    </div>
  );
}
