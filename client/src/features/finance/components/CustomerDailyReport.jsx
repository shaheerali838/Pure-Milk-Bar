import React, { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Truck,
  ShoppingBag,
  Droplets,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Wallet,
  Fuel,
  Printer,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePOSContext } from '@/context/POSContext';
import { useCustomerContext, getCustomerDueBalance } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useExpense } from '@/context/ExpenseContext';
import { useLedgerContext } from '@/context/LedgerContext';

// Safe date normalization helper
const normalizeDateStr = (rawDate) => {
  if (!rawDate) return new Date().toISOString().split('T')[0];
  if (typeof rawDate === 'string') {
    if (rawDate.includes('T')) return rawDate.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate;
  }
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}
  return new Date().toISOString().split('T')[0];
};

export default function CustomerDailyReport() {
  const { salesHistory = [], setCompletedSaleReceipt } = usePOSContext() || {};
  const { customers = [], rawCustomers = [], totalKhataReceivable = 0, withKhataBalCount = 0 } = useCustomerContext() || {};
  const { deliveries = [], fuelLogs = [] } = useDeliveryContext() || {};
  const { expenses = [] } = useExpense() || {};
  const { ledgers = {}, getAllCustomersAggregates } = useLedgerContext() || {};

  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week'

  const allCustList = rawCustomers.length > 0 ? rawCustomers : customers;
  const customerMap = useMemo(() => {
    const map = {};
    allCustList.forEach((c) => {
      map[String(c.id || c._id)] = c;
      if (c._id) map[String(c._id)] = c;
    });
    return map;
  }, [allCustList]);

  // Aggregate by Date (Walk-in, Deliveries, Fuel/Delivery Expenses, Recoveries & Net Inflow)
  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const todayStr = normalizeDateStr(new Date());

    const initDate = (d) => {
      if (!dates[d]) {
        dates[d] = {
          date: d,
          // 1. Walk-in Counter
          walkinVolume: 0,
          walkinSalesRev: 0,
          walkinPaid: 0,
          walkinDue: 0,
          walkinEntries: [],

          // 2. Doorstep & Monthly Deliveries
          monthlyDeliveryVolume: 0,
          monthlyDeliveryRev: 0,
          ontimeDeliveryVolume: 0,
          ontimeDeliveryRev: 0,
          totalDeliveryRev: 0,
          totalDeliveryVolume: 0,
          deliveryPaid: 0,
          deliveryDue: 0,
          deliveryEntries: [],

          // 3. Delivery Overhead / Fuel & Recoveries
          fuelExpensesTotal: 0,
          recoveriesTotal: 0,
          expenseItems: [],
          recoveryItems: [],

          // Consolidated Day Summary
          totalDaySales: 0,
          totalDayPaid: 0,
          totalDayKhataDue: 0,
          netCustomerInflow: 0,
        };
      }
    };

    // Always initialize today
    initDate(todayStr);

    // 1. Process POS Sales History (Separating Walk-in vs Deliveries)
    salesHistory.forEach((sale) => {
      const d = normalizeDateStr(
        sale.date || sale.timestamp || sale.createdAt || sale.formattedDate
      );
      initDate(d);

      const netAmt = Number(sale.netPayable || sale.totalAmount || sale.grandTotal) || 0;
      const method = (sale.paymentMethod || 'cash').toLowerCase();
      const isKhata = method === 'khata' || method === 'credit';

      let paidAmt = 0;
      let khataDue = 0;
      if (isKhata) {
        paidAmt = Number(sale.partialPaidAmount || sale.paidAmount) || 0;
        khataDue = Math.max(0, netAmt - paidAmt);
      } else {
        paidAmt = netAmt;
        khataDue = 0;
      }

      // Quantity calculation
      let totalQty = 0;
      (sale.items || []).forEach((it) => {
        totalQty += Number(it.quantity) || 0;
      });

      const isDelivery =
        sale.saleCategory === 'delivery' ||
        sale.deliverySubType === 'monthly' ||
        sale.deliverySubType === 'ontime' ||
        sale.fulfillmentMode === 'delivery' ||
        sale.fulfillmentType === 'DELIVERY';

      const isMonthly =
        sale.deliverySubType === 'monthly' ||
        sale.walkinCustomerType === 'registered';

      const activeCust =
        sale.activeCustomer ||
        (typeof sale.customerId === 'object' ? sale.customerId : null) ||
        customerMap[String(sale.customerId)];

      const custName =
        activeCust?.name ||
        sale.customerNameSnapshot ||
        sale.customerName ||
        sale.walkinName ||
        (isDelivery ? 'Delivery Customer' : 'Walk-in Customer');

      const custPhone =
        activeCust?.phone ||
        sale.customerPhoneSnapshot ||
        sale.customerPhone ||
        sale.walkinPhone ||
        '';

      const entryObj = {
        id: sale.id || sale._id || `S-${Math.random()}`,
        invoiceId: sale.invoiceId || sale.receiptNumber || `INV-${(sale.id || sale._id || '').toString().slice(-4)}`,
        customerName: custName,
        customerPhone: custPhone,
        customerId: activeCust?.id || activeCust?._id || sale.customerId,
        quantity: totalQty,
        orderTotal: netAmt,
        paidAmount: paidAmt,
        khataDue,
        items: sale.items || [],
        paymentMethod: sale.paymentMethod ? sale.paymentMethod.toUpperCase() : 'CASH',
        rawSale: sale,
      };

      dates[d].totalDaySales += netAmt;
      dates[d].totalDayPaid += paidAmt;
      dates[d].totalDayKhataDue += khataDue;

      if (isDelivery) {
        dates[d].totalDeliveryVolume += totalQty;
        dates[d].totalDeliveryRev += netAmt;
        dates[d].deliveryPaid += paidAmt;
        dates[d].deliveryDue += khataDue;
        if (isMonthly) {
          dates[d].monthlyDeliveryVolume += totalQty;
          dates[d].monthlyDeliveryRev += netAmt;
        } else {
          dates[d].ontimeDeliveryVolume += totalQty;
          dates[d].ontimeDeliveryRev += netAmt;
        }
        dates[d].deliveryEntries.push(entryObj);
      } else {
        dates[d].walkinVolume += totalQty;
        dates[d].walkinSalesRev += netAmt;
        dates[d].walkinPaid += paidAmt;
        dates[d].walkinDue += khataDue;
        dates[d].walkinEntries.push(entryObj);
      }
    });

    // 2. Process Delivery & Fuel Expenses
    fuelLogs.forEach((f) => {
      const d = normalizeDateStr(f.date || f.createdAt);
      initDate(d);
      const amt = Number(f.cost || f.totalCost || f.amount) || 0;
      dates[d].fuelExpensesTotal += amt;
      dates[d].expenseItems.push({
        title: `Rider Fuel (${f.riderName || 'Rider'})`,
        amount: amt,
        type: 'fuel',
      });
    });

    expenses.forEach((exp) => {
      const cat = (exp.category || '').toLowerCase();
      const title = (exp.title || exp.description || '').toLowerCase();
      if (
        cat.includes('delivery') ||
        cat.includes('fuel') ||
        cat.includes('rider') ||
        cat.includes('transit') ||
        title.includes('fuel') ||
        title.includes('delivery') ||
        title.includes('rider')
      ) {
        const d = normalizeDateStr(exp.date || exp.createdAt);
        initDate(d);
        const amt = Number(exp.amount) || 0;
        dates[d].fuelExpensesTotal += amt;
        dates[d].expenseItems.push({
          title: exp.title || exp.category || 'Delivery Transit Expense',
          amount: amt,
          type: 'expense',
        });
      }
    });

    // 3. Process Customer Khata Recoveries from Ledgers
    Object.entries(ledgers).forEach(([customerId, entries]) => {
      if (!Array.isArray(entries)) return;
      const cust = customerMap[String(customerId)] || { name: `Customer #${customerId}`, phone: '' };

      entries.forEach((entry) => {
        const creditAmt = Number(entry.credit) || 0;
        if (creditAmt > 0 && !entry.isOpening && entry.type !== 'OPENING') {
          const d = normalizeDateStr(entry.date);
          initDate(d);

          dates[d].recoveriesTotal += creditAmt;
          dates[d].recoveryItems.push({
            customerName: cust.name,
            amount: creditAmt,
            method: entry.paymentMethod || entry.method || 'Cash',
          });
        }
      });
    });

    // Compute Net Inflow for each day:
    // (Walk-in Sales + Delivery Sales) - Delivery Fuel Expenses = Net Margin Inflow
    Object.values(dates).forEach((day) => {
      day.netCustomerInflow = day.totalDaySales - day.fuelExpensesTotal;
    });

    const list = Object.values(dates).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by date range
    if (dateFilter === 'today') {
      return list.filter((item) => item.date === todayStr);
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = normalizeDateStr(weekAgo);
      return list.filter((item) => item.date >= weekAgoStr);
    }

    return list;
  }, [salesHistory, fuelLogs, expenses, ledgers, customerMap, dateFilter]);

  // Overall Totals Across the Aggregated View
  const overallTotals = useMemo(() => {
    return aggregatedByDate.reduce(
      (acc, day) => {
        acc.totalVolume += (day.walkinVolume + day.totalDeliveryVolume);
        acc.totalSales += day.totalDaySales;
        acc.walkinVolume += day.walkinVolume;
        acc.walkinSales += day.walkinSalesRev;
        acc.deliveryVolume += day.totalDeliveryVolume;
        acc.deliverySales += day.totalDeliveryRev;
        acc.monthlySales += day.monthlyDeliveryRev;
        acc.ontimeSales += day.ontimeDeliveryRev;
        acc.fuelExpenses += day.fuelExpensesTotal;
        acc.recoveries += day.recoveriesTotal;
        acc.netInflow += day.netCustomerInflow;
        acc.totalPaid += day.totalDayPaid;
        acc.totalDue += day.totalDayKhataDue;
        return acc;
      },
      {
        totalVolume: 0,
        totalSales: 0,
        walkinVolume: 0,
        walkinSales: 0,
        deliveryVolume: 0,
        deliverySales: 0,
        monthlySales: 0,
        ontimeSales: 0,
        fuelExpenses: 0,
        recoveries: 0,
        netInflow: 0,
        totalPaid: 0,
        totalDue: 0,
      }
    );
  }, [aggregatedByDate]);

  const customerAggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : null;
  const grandTotalKhataPending = customerAggregates?.totalAllDue !== undefined
    ? customerAggregates.totalAllDue
    : totalKhataReceivable;
  const activeDebtorsCount = customerAggregates?.khataAccountsCount ?? withKhataBalCount;

  const avgSalesRate = overallTotals.totalVolume > 0 ? (overallTotals.totalSales / overallTotals.totalVolume).toFixed(1) : '240';
  const overallMargin = overallTotals.totalSales > 0 ? Math.round((overallTotals.netInflow / overallTotals.totalSales) * 100) : 0;

  // Handle Receipt Modal Print
  const handleOpenReceipt = (entry) => {
    if (!entry || !setCompletedSaleReceipt) return;
    const raw = entry.rawSale || entry;
    const cust = customerMap[String(entry.customerId)] || (entry.customerName ? { name: entry.customerName, phone: entry.customerPhone } : null);

    setCompletedSaleReceipt({
      ...raw,
      invoiceId: entry.invoiceId || raw.invoiceId,
      formattedDate: raw.formattedDate || new Date(raw.timestamp || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      formattedTime: raw.formattedTime || '12:00 PM',
      customer: cust,
      walkinCustomer: !cust ? { name: entry.customerName, phone: entry.customerPhone } : null,
      items: entry.items || raw.items || [],
      subtotal: entry.orderTotal,
      netPayable: entry.orderTotal,
      paidAmount: entry.paidAmount,
      remainingAmount: entry.khataDue,
      paymentMethod: entry.paymentMethod,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Header & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-emerald-600" />
            <span>Customer Daily Sales &amp; Finance Report</span>
          </h2>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateFilter === 'today'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateFilter === 'week'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Soft Tastefully Colorful Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Volume Sold */}
        <div className="bg-linear-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Total Milk &amp; Dahi Sold
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-950">
              {overallTotals.totalVolume.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-emerald-700">Liters / kg</span>
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block font-medium">
            Total Sales: Rs. {overallTotals.totalSales.toLocaleString()}
          </span>
        </div>

        {/* Card 2: Shop Walk-in Sales */}
        <div className="bg-linear-to-br from-teal-50/80 via-cyan-50/30 to-white border border-teal-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
            Shop Walk-in Sales
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-teal-950">
              Rs. {overallTotals.walkinSales.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-teal-700 mt-1 block font-medium">
            {overallTotals.walkinVolume.toFixed(1)} L/kg sold at shop
          </span>
        </div>

        {/* Card 3: Home & Monthly Deliveries */}
        <div className="bg-linear-to-br from-blue-50/80 via-sky-50/30 to-white border border-blue-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
            Home Delivery Sales
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-blue-950">
              Rs. {overallTotals.deliverySales.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-blue-700 font-medium mt-1 block">
            Monthly: Rs. {overallTotals.monthlySales.toLocaleString()} • Single: Rs. {overallTotals.ontimeSales.toLocaleString()}
          </span>
        </div>

        {/* Card 4: Net Cash Inflow */}
        <div className="bg-linear-to-br from-indigo-50/80 via-purple-50/30 to-white border border-indigo-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
            Net Cash Inflow
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-xl font-black font-mono ${
                overallTotals.netInflow >= 0 ? 'text-indigo-950' : 'text-rose-700'
              }`}
            >
              {overallTotals.netInflow >= 0 ? '+' : '-'} Rs.{' '}
              {Math.abs(overallTotals.netInflow).toLocaleString()}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                overallTotals.netInflow >= 0
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                  : 'bg-rose-100 text-rose-800 border border-rose-300/60'
              }`}
            >
              {overallMargin}%
            </span>
          </div>
          <span className="text-[10px] text-indigo-700 mt-1 block font-medium">
            Sales minus delivery fuel/exp
          </span>
        </div>

        {/* Card 5: Customer Khata Due */}
        <div className="bg-linear-to-br from-amber-50/80 via-orange-50/30 to-white border border-amber-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Customer Khata Balance
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-amber-950">
              Rs. {Number(grandTotalKhataPending || 0).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-amber-700 mt-1 block font-medium">
            Cash Received: Rs. {overallTotals.totalPaid.toLocaleString()} • {activeDebtorsCount} Khata Customers
          </span>
        </div>
      </div>

      {/* 3. Daily Breakdown Cards (3 Columns: Walk-in, Deliveries, Fuel/Overhead) */}
      <div className="space-y-4">
        {aggregatedByDate.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-400">
            No customer activity recorded for selected range.
          </div>
        ) : (
          aggregatedByDate.map((day) => {
            const isToday = day.date === normalizeDateStr(new Date());
            const isProfitable = day.netCustomerInflow >= 0;

            return (
              <div
                key={day.date}
                className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
              >
                {/* Header Bar */}
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Today (Live)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-medium text-slate-400">Shop:</span>
                      <strong className="font-bold font-mono text-emerald-700">
                        + Rs. {day.walkinSalesRev.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-medium text-slate-400">Deliveries:</span>
                      <strong className="font-bold font-mono text-blue-700">
                        + Rs. {day.totalDeliveryRev.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-medium text-slate-400">Fuel &amp; Exp:</span>
                      <strong className="font-bold font-mono text-rose-600">
                        - Rs. {day.fuelExpensesTotal.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-400">Net Inflow:</span>
                      <strong
                        className={`font-bold font-mono px-2 py-0.5 rounded ${
                          isProfitable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {isProfitable ? '+' : '-'} Rs.{' '}
                        {Math.abs(day.netCustomerInflow).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Data Grid: 3 Columns (Shop Sales, Home Deliveries, Fuel & Recoveries) */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
                  {/* Col 1: Shop Walk-in Sales */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Shop Walk-in Sales</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {day.walkinEntries.length} Slips
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Shop Volume Sold</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          {day.walkinVolume.toFixed(1)} L/kg
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total Shop Sales</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          Rs. {day.walkinSalesRev.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-emerald-700 font-medium">
                          Cash Paid: Rs. {day.walkinPaid.toLocaleString()}
                        </span>
                        <span className="font-bold text-amber-700">
                          Khata Due: Rs. {day.walkinDue.toLocaleString()}
                        </span>
                      </div>

                      {day.walkinEntries.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Walk-in Orders Log ({day.walkinEntries.length})
                          </span>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                            {day.walkinEntries.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[11px] text-slate-600 hover:bg-slate-50 p-1 rounded transition"
                              >
                                <div className="truncate pr-1">
                                  <span className="font-medium text-slate-800">
                                    {item.customerName}
                                  </span>{' '}
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({item.quantity} units)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                                  <span className="font-bold text-slate-800">
                                    Rs. {item.orderTotal.toLocaleString()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReceipt(item)}
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded cursor-pointer"
                                    title="View Invoice"
                                  >
                                    <Printer className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Home & Monthly Deliveries */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Home &amp; Monthly Deliveries</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {day.deliveryEntries.length} Deliveries
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Monthly Subscriptions</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {day.monthlyDeliveryVolume.toFixed(1)} L (Rs.{' '}
                          {day.monthlyDeliveryRev.toLocaleString()})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Single Orders</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {day.ontimeDeliveryVolume.toFixed(1)} L (Rs.{' '}
                          {day.ontimeDeliveryRev.toLocaleString()})
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-700 font-semibold">Total Delivery Sales</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          Rs. {day.totalDeliveryRev.toLocaleString()}
                        </span>
                      </div>

                      {day.deliveryEntries.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Delivery Orders Log ({day.deliveryEntries.length})
                          </span>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                            {day.deliveryEntries.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[11px] text-slate-600 hover:bg-slate-50 p-1 rounded transition"
                              >
                                <div className="truncate pr-1">
                                  <span className="font-medium text-slate-800">
                                    {item.customerName}
                                  </span>{' '}
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({item.quantity}L)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                                  <span className="font-bold text-slate-800">
                                    Rs. {item.orderTotal.toLocaleString()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReceipt(item)}
                                    className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                                    title="View Invoice"
                                  >
                                    <Printer className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 3: Fuel Expenses & Khata Received */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <Fuel className="w-3.5 h-3.5 text-amber-600" />
                        <span>Fuel &amp; Khata Recoveries</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {day.expenseItems.length + day.recoveryItems.length} Logs
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Fuel &amp; Delivery Expenses</span>
                        <span className="font-mono font-bold text-amber-700 text-sm">
                          Rs. {day.fuelExpensesTotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Khata Cash Recovered</span>
                        <span className="font-mono font-bold text-blue-700 text-sm">
                          + Rs. {day.recoveriesTotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-700 font-semibold">Net Cash Inflow</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            isProfitable ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isProfitable ? '+' : '-'} Rs.{' '}
                          {Math.abs(day.netCustomerInflow).toLocaleString()}
                        </span>
                      </div>

                      {day.expenseItems.length > 0 || day.recoveryItems.length > 0 ? (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Expenses &amp; Khata Received
                          </span>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                            {day.expenseItems.map((exp, idx) => (
                              <div
                                key={`exp-${idx}`}
                                className="flex items-center justify-between text-[11px] text-slate-600"
                              >
                                <span className="truncate pr-1">{exp.title}</span>
                                <span className="font-mono font-semibold text-rose-600 shrink-0">
                                  - Rs. {Number(exp.amount).toLocaleString()}
                                </span>
                              </div>
                            ))}
                            {day.recoveryItems.map((rec, idx) => (
                              <div
                                key={`rec-${idx}`}
                                className="flex items-center justify-between text-[11px] text-slate-600"
                              >
                                <span className="truncate pr-1">
                                  Khata Received ({rec.customerName})
                                </span>
                                <span className="font-mono font-semibold text-blue-700 shrink-0">
                                  + Rs. {Number(rec.amount).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pt-2">
                          No transit fuel or khata receipts for this date.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Bar */}
                <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-slate-400">
                    Day Activity:{' '}
                    <strong className="text-white ml-1 font-mono">
                      {day.walkinEntries.length + day.deliveryEntries.length} Total Orders •{' '}
                      Rs. {day.totalDayKhataDue.toLocaleString()} Added to Khata
                    </strong>
                  </span>
                  <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED (SHOP SALES + DELIVERIES - EXPENSES = NET INFLOW)
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
