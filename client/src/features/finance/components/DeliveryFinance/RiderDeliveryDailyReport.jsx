import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Truck,
  Bike,
  Droplets,
  DollarSign,
  CheckCircle2,
  Wallet,
  Fuel,
  Printer,
  Users,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useFuelLogContext } from '@/context/FuelLogContext';
import { useRiderSalaryContext } from '@/context/RiderSalaryContext';
import { useStaffContext } from '@/context/StaffContext';
import { useExpense } from '@/context/ExpenseContext';
import { usePOSContext } from '@/context/POSContext';

// Helper to normalize any date into YYYY-MM-DD
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

export default function RiderDeliveryDailyReport() {
  const { customers = [], rawCustomers = [] } = useCustomerContext() || {};
  const { deliveries = [] } = useDeliveryContext() || {};
  const { staffList: deliveryStaffList = [] } = useDeliveryStaffContext() || {};
  const { staffList: allStaffList = [] } = useStaffContext() || {};
  const { fuelLogs = [] } = useFuelLogContext() || {};
  const { salaries = [] } = useRiderSalaryContext() || {};
  const { expenses = [] } = useExpense() || {};
  const { salesHistory = [] } = usePOSContext() || {};

  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReceiptDrop, setActiveReceiptDrop] = useState(null);

  const allCustList = rawCustomers.length > 0 ? rawCustomers : customers;
  const customerMap = useMemo(() => {
    const map = {};
    allCustList.forEach((c) => {
      map[String(c.id || c._id)] = c;
      if (c._id) map[String(c._id)] = c;
    });
    return map;
  }, [allCustList]);

  // Combined active delivery staff map
  const staffMap = useMemo(() => {
    const map = {};
    const combined = [...deliveryStaffList, ...allStaffList];
    combined.forEach((s) => {
      const idKey = String(s.id || s._id);
      map[idKey] = s;
      if (s.name) {
        map[s.name.toLowerCase().trim()] = s;
      }
    });
    return map;
  }, [deliveryStaffList, allStaffList]);

  // Daily Aggregation of Deliveries, Riders, Fuel, and Salaries
  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const todayStr = normalizeDateStr(new Date());

    const initDate = (d) => {
      if (!dates[d]) {
        dates[d] = {
          date: d,
          // Column 1: Customer Drops
          totalDrops: 0,
          completedDrops: 0,
          pendingDrops: 0,
          totalVolume: 0,
          totalBilled: 0,
          totalCollected: 0,
          totalDue: 0,
          customerDropsList: [],

          // Column 2: Rider Performance & Handover
          ridersMap: {}, // keyed by riderId or riderName
          activeRidersCount: 0,

          // Column 3: Transit Fuel & Salary Disbursements
          fuelList: [],
          totalFuelCost: 0,
          totalFuelLiters: 0,
          salaryList: [],
          totalSalariesDisbursed: 0,
          combinedExpenses: 0,

          // Bottom Reconciled Net
          netInflow: 0,
        };
      }
    };

    // Always init today
    initDate(todayStr);

    const processedDropIds = new Set();

    // 1. Process Deliveries from DeliveryContext
    deliveries.forEach((del) => {
      const d = normalizeDateStr(del.date || del.createdAt || del.deliveredAt);
      initDate(d);

      const dropId = String(del._id || del.id || `del-${Math.random()}`);
      if (processedDropIds.has(dropId)) return;
      processedDropIds.add(dropId);

      const cust = customerMap[String(del.customerId)] || {};
      const custName = del.customerName || cust.name || 'Walk-in Delivery Customer';
      const custPhone = del.customerPhone || cust.phone || '—';
      const custArea = del.deliveryAddress || cust.area || cust.address || 'Local Route';

      const riderName = del.riderNameSnapshot || del.riderName || 'Unassigned Rider';
      const riderId = del.riderId || riderName;

      const qty = Number(del.qtyLiters) || (Array.isArray(del.items) ? del.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) : 0);
      const totalBilled = Number(del.codAmountToCollect || del.totalAmount || del.amountPaid + del.amountDue) || 0;
      const isDelivered = del.status === 'DELIVERED' || del.status === 'COMPLETED';
      const amountPaid = Number(del.amountPaid) || (isDelivered && (del.paymentStatus === 'PAID' || del.paymentMode === 'CASH') ? totalBilled : 0);
      const amountDue = Number(del.amountDue) !== undefined && Number(del.amountDue) !== null ? Number(del.amountDue) : Math.max(0, totalBilled - amountPaid);

      const dropObj = {
        id: dropId,
        date: d,
        customerName: custName,
        phone: custPhone,
        area: custArea,
        riderName,
        riderId,
        quantity: qty,
        orderTotal: totalBilled,
        amountPaid,
        amountDue,
        paymentMode: (del.paymentMode || 'CASH').toUpperCase(),
        paymentStatus: del.paymentStatus || (amountDue <= 0 ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID'),
        status: del.status || 'DELIVERED',
        shift: del.shift || 'MORNING',
        items: Array.isArray(del.items) && del.items.length > 0 ? del.items : [{ itemName: del.itemDescription || 'Pure Milk', quantity: qty, rate: qty > 0 ? Math.round(totalBilled / qty) : totalBilled, total: totalBilled }],
        receiptNumber: del.receiptNumber || del.invoiceNumber || `DEL-${dropId.slice(-4).toUpperCase()}`,
        raw: del,
      };

      dates[d].customerDropsList.push(dropObj);
      dates[d].totalDrops += 1;
      if (isDelivered) {
        dates[d].completedDrops += 1;
      } else {
        dates[d].pendingDrops += 1;
      }
      dates[d].totalVolume += qty;
      dates[d].totalBilled += totalBilled;
      dates[d].totalCollected += amountPaid;
      dates[d].totalDue += amountDue;

      // Group in rider map for Column 2
      const riderKey = String(riderId);
      if (!dates[d].ridersMap[riderKey]) {
        const staffObj = staffMap[riderKey] || staffMap[riderName.toLowerCase().trim()] || {};
        dates[d].ridersMap[riderKey] = {
          riderId,
          riderName,
          phone: staffObj.phone || del.riderPhone || '—',
          route: staffObj.route || del.route || 'Delivery Route',
          vehicle: staffObj.vehicle || del.vehicleType || 'Motorcycle',
          assignedDrops: 0,
          completedDrops: 0,
          totalVolume: 0,
          cashCollected: 0,
          khataLogged: 0,
          salaryPaidToday: 0,
        };
      }

      dates[d].ridersMap[riderKey].assignedDrops += 1;
      if (isDelivered) dates[d].ridersMap[riderKey].completedDrops += 1;
      dates[d].ridersMap[riderKey].totalVolume += qty;
      dates[d].ridersMap[riderKey].cashCollected += amountPaid;
      dates[d].ridersMap[riderKey].khataLogged += amountDue;
    });

    // 2. Process POS sales that were marked as Delivery
    salesHistory.forEach((sale) => {
      const isDelivery =
        sale.saleCategory === 'delivery' ||
        sale.deliverySubType === 'monthly' ||
        sale.deliverySubType === 'ontime' ||
        sale.fulfillmentMode === 'delivery' ||
        sale.fulfillmentType === 'DELIVERY';

      if (!isDelivery) return;

      const d = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt);
      initDate(d);

      const dropId = String(sale.id || sale._id || sale.receiptNumber || `pos-${Math.random()}`);
      if (processedDropIds.has(dropId)) return;
      processedDropIds.add(dropId);

      const cust = sale.activeCustomer || customerMap[String(sale.customerId)] || {};
      const custName = cust.name || sale.customerNameSnapshot || sale.walkinName || 'POS Delivery Customer';
      const custPhone = cust.phone || sale.customerPhone || '—';
      const custArea = sale.deliveryAddress || cust.address || cust.area || 'Direct Delivery';

      const riderName = sale.riderName || sale.assignedRider || 'Store Dispatch';
      const riderId = sale.riderId || riderName;

      let qty = 0;
      (sale.items || []).forEach((it) => {
        qty += Number(it.quantity) || 0;
      });

      const netAmt = Number(sale.netPayable || sale.totalAmount || sale.grandTotal) || 0;
      const method = (sale.paymentMethod || 'cash').toLowerCase();
      const isKhata = method === 'khata' || method === 'credit';
      const amountPaid = isKhata ? Number(sale.partialPaidAmount || sale.paidAmount) || 0 : netAmt;
      const amountDue = Math.max(0, netAmt - amountPaid);

      const dropObj = {
        id: dropId,
        date: d,
        customerName: custName,
        phone: custPhone,
        area: custArea,
        riderName,
        riderId,
        quantity: qty,
        orderTotal: netAmt,
        amountPaid,
        amountDue,
        paymentMode: (sale.paymentMethod || 'CASH').toUpperCase(),
        paymentStatus: isKhata ? (amountDue <= 0 ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID') : 'PAID',
        status: 'DELIVERED',
        shift: sale.shift || 'MORNING',
        items: sale.items || [{ itemName: 'Dairy Delivery', quantity: qty, rate: qty > 0 ? Math.round(netAmt / qty) : netAmt, total: netAmt }],
        receiptNumber: sale.receiptNumber || sale.invoiceNumber || `POS-${dropId.slice(-4).toUpperCase()}`,
        raw: sale,
      };

      dates[d].customerDropsList.push(dropObj);
      dates[d].totalDrops += 1;
      dates[d].completedDrops += 1;
      dates[d].totalVolume += qty;
      dates[d].totalBilled += netAmt;
      dates[d].totalCollected += amountPaid;
      dates[d].totalDue += amountDue;

      const riderKey = String(riderId);
      if (!dates[d].ridersMap[riderKey]) {
        const staffObj = staffMap[riderKey] || staffMap[riderName.toLowerCase().trim()] || {};
        dates[d].ridersMap[riderKey] = {
          riderId,
          riderName,
          phone: staffObj.phone || '—',
          route: staffObj.route || 'Store Delivery',
          vehicle: staffObj.vehicle || 'Bike',
          assignedDrops: 0,
          completedDrops: 0,
          totalVolume: 0,
          cashCollected: 0,
          khataLogged: 0,
          salaryPaidToday: 0,
        };
      }

      dates[d].ridersMap[riderKey].assignedDrops += 1;
      dates[d].ridersMap[riderKey].completedDrops += 1;
      dates[d].ridersMap[riderKey].totalVolume += qty;
      dates[d].ridersMap[riderKey].cashCollected += amountPaid;
      dates[d].ridersMap[riderKey].khataLogged += amountDue;
    });

    // 3. Process Fuel Logs and Fuel Expenses (Column 3 - Section A)
    const processedFuelIds = new Set();
    fuelLogs.forEach((fl) => {
      const d = normalizeDateStr(fl.date || fl.createdAt);
      initDate(d);

      const fId = String(fl._id || fl.id || `fl-${Math.random()}`);
      if (processedFuelIds.has(fId)) return;
      processedFuelIds.add(fId);

      const cost = Number(fl.cost || fl.amount) || 0;
      const liters = Number(fl.liters || fl.quantity) || 0;
      const rider = fl.riderNameSnapshot || fl.riderName || (fl.staffId ? (staffMap[String(fl.staffId)]?.name) : null) || 'Fleet Fuel';

      dates[d].fuelList.push({
        id: fId,
        riderName: rider,
        liters,
        cost,
        distanceKm: fl.distanceKm || fl.odometer || '—',
        notes: fl.notes || fl.description || 'Fuel & Transit',
        type: 'FUEL_LOG',
      });

      dates[d].totalFuelCost += cost;
      dates[d].totalFuelLiters += liters;
    });

    // Additional fuel expenses from ExpenseContext
    expenses.forEach((exp) => {
      const cat = (exp.category || '').toUpperCase();
      const title = (exp.title || '').toUpperCase();
      const isFuel = cat === 'FUEL' || cat === 'TRANSPORT' || cat === 'PETROL' || title.includes('FUEL') || title.includes('PETROL');
      if (!isFuel) return;

      const d = normalizeDateStr(exp.date || exp.createdAt);
      initDate(d);

      const eId = String(exp._id || exp.id);
      if (processedFuelIds.has(eId)) return;
      processedFuelIds.add(eId);

      const cost = Number(exp.amountRupees || exp.amount) || 0;
      const rider = exp.authorizedBy || exp.title?.replace(/.*(?:for|rider|to)\s*:?\s*/i, '') || 'Rider Transit';

      dates[d].fuelList.push({
        id: eId,
        riderName: rider,
        liters: Number(exp.liters) || 0,
        cost,
        distanceKm: '—',
        notes: exp.title || exp.notes || 'Fuel Expense',
        type: 'EXPENSE_VOUCHER',
      });

      dates[d].totalFuelCost += cost;
    });

    // 4. Process Salary Disbursements to Riders (Column 3 - Section B)
    const processedSalaryIds = new Set();

    salaries.forEach((sal) => {
      (sal.payments || []).forEach((pmt) => {
        const d = normalizeDateStr(pmt.date || pmt.createdAt);
        initDate(d);

        const pId = String(pmt._id || pmt.id || `sal-${Math.random()}`);
        if (processedSalaryIds.has(pId)) return;
        processedSalaryIds.add(pId);

        const amt = Number(pmt.amount) || 0;
        const riderName = sal.staffName || pmt.staffName || 'Rider';

        dates[d].salaryList.push({
          id: pId,
          staffName: riderName,
          role: 'Delivery Rider',
          amount: amt,
          paymentMode: pmt.paymentMode || 'CASH',
          notes: pmt.notes || `Salary Disbursement for ${sal.month || 'Month'}`,
          source: 'RIDER_PAYROLL',
        });

        dates[d].totalSalariesDisbursed += amt;

        const rKey = String(sal.staffId || riderName);
        if (dates[d].ridersMap[rKey]) {
          dates[d].ridersMap[rKey].salaryPaidToday += amt;
        }
      });
    });

    expenses.forEach((exp) => {
      const cat = (exp.category || '').toUpperCase();
      const title = (exp.title || '').toUpperCase();
      const isSalary = cat === 'SALARIES' || cat === 'SALARY' || title.includes('SALARY') || title.includes('PAYROLL');
      if (!isSalary) return;

      const d = normalizeDateStr(exp.date || exp.createdAt);
      initDate(d);

      const eId = String(exp._id || exp.id);
      if (processedSalaryIds.has(eId)) return;
      processedSalaryIds.add(eId);

      const amt = Number(exp.amountRupees || exp.amount) || 0;
      const rawName = exp.authorizedBy || exp.title?.replace(/.*(?:payment|for|rider|to)\s*:?\s*/i, '') || 'Staff / Rider';

      dates[d].salaryList.push({
        id: eId,
        staffName: rawName,
        role: 'Delivery Staff',
        amount: amt,
        paymentMode: (exp.paymentMethod || 'CASH').toUpperCase(),
        notes: exp.title || exp.notes || 'Salary Payout',
        source: 'EXPENSE_PAYROLL',
      });

      dates[d].totalSalariesDisbursed += amt;
    });

    // 5. Compute Net Rider Cash Inflow per Date
    Object.keys(dates).forEach((d) => {
      const day = dates[d];
      day.activeRidersCount = Object.keys(day.ridersMap).length;
      day.combinedExpenses = day.totalFuelCost + day.totalSalariesDisbursed;
      day.netInflow = day.totalCollected - day.totalFuelCost - day.totalSalariesDisbursed;
    });

    return dates;
  }, [deliveries, salesHistory, fuelLogs, salaries, expenses, customerMap, staffMap]);

  // Sorted date array (newest first)
  const sortedDates = useMemo(() => {
    return Object.keys(aggregatedByDate).sort((a, b) => new Date(b) - new Date(a));
  }, [aggregatedByDate]);

  // Filter dates based on selected dateFilter ('today', 'week', 'month', 'all')
  const filteredDateKeys = useMemo(() => {
    const todayStr = normalizeDateStr(new Date());
    const todayObj = new Date(todayStr);

    return sortedDates.filter((dateStr) => {
      if (dateFilter === 'today') {
        return dateStr === todayStr;
      }
      if (dateFilter === 'week') {
        const target = new Date(dateStr);
        const diffDays = (todayObj.getTime() - target.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (dateFilter === 'month') {
        return dateStr.startsWith(todayStr.slice(0, 7));
      }
      return true;
    });
  }, [sortedDates, dateFilter]);

  // Overall Global KPI Totals based on filtered date keys
  const overallTotals = useMemo(() => {
    let totalDrops = 0;
    let totalVolume = 0;
    let totalBilled = 0;
    let totalCollected = 0;
    let totalDue = 0;
    let totalFuel = 0;
    let totalSalaries = 0;

    filteredDateKeys.forEach((d) => {
      const day = aggregatedByDate[d];
      if (day) {
        totalDrops += day.totalDrops;
        totalVolume += day.totalVolume;
        totalBilled += day.totalBilled;
        totalCollected += day.totalCollected;
        totalDue += day.totalDue;
        totalFuel += day.totalFuelCost;
        totalSalaries += day.totalSalariesDisbursed;
      }
    });

    const netInflow = totalCollected - totalFuel - totalSalaries;

    return {
      totalDrops,
      totalVolume,
      totalBilled,
      totalCollected,
      totalDue,
      totalFuel,
      totalSalaries,
      netInflow,
    };
  }, [filteredDateKeys, aggregatedByDate]);

  const handlePrintReceipt = (drop) => {
    setActiveReceiptDrop(drop);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Header & Filter Bar (Clean and Simple) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4.5 h-4.5 text-blue-600" />
            Rider &amp; Delivery Daily Report
          </h2>
        </div>

        {/* Search Bar & Date Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, rider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 w-40 sm:w-48"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
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
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                dateFilter === 'month'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All History
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Soft Tastefully Colorful Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Liters Delivered */}
        <div className="bg-linear-to-br from-blue-50/80 via-sky-50/30 to-white border border-blue-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
            Total Milk Delivered
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-blue-950">
              {overallTotals.totalVolume.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-blue-700">Liters</span>
          </div>
          <span className="text-[10px] text-blue-700 mt-1 block font-medium">
            Across {overallTotals.totalDrops} customer deliveries
          </span>
        </div>

        {/* Card 2: Delivery Sales Value */}
        <div className="bg-linear-to-br from-sky-50/80 via-indigo-50/30 to-white border border-sky-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
            Total Delivery Bill
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-sky-950">
              Rs. {overallTotals.totalBilled.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-sky-700 mt-1 block font-medium">
            Khata Due: Rs. {overallTotals.totalDue.toLocaleString()}
          </span>
        </div>

        {/* Card 3: Rider Cash Collected */}
        <div className="bg-linear-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Cash Collected by Riders
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-950">
              Rs. {overallTotals.totalCollected.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block font-medium">
            Handed over to shop
          </span>
        </div>

        {/* Card 4: Fuel & Transit Expense */}
        <div className="bg-linear-to-br from-amber-50/80 via-orange-50/30 to-white border border-amber-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Rider Fuel Expense
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-amber-950">
              Rs. {overallTotals.totalFuel.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-amber-700 mt-1 block font-medium">
            Petrol &amp; vehicle cost
          </span>
        </div>

        {/* Card 5: Salaries Disbursed */}
        <div className="bg-linear-to-br from-purple-50/80 via-fuchsia-50/30 to-white border border-purple-200/80 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
            Rider Salaries Paid
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-purple-950">
              Rs. {overallTotals.totalSalaries.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-purple-700 mt-1 block font-medium">
            Net Inflow: Rs. {overallTotals.netInflow.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Main Daily Grouped Blocks (3 Columns: Customer Deliveries, Rider Collections, Fuel & Salaries) */}
      <div className="space-y-4">
        {filteredDateKeys.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-400">
            No delivery or rider records found for this period.
          </div>
        ) : (
          filteredDateKeys.map((dateKey) => {
            const day = aggregatedByDate[dateKey];
            if (!day) return null;

            const isToday = dateKey === normalizeDateStr(new Date());
            const isProfitable = day.netInflow >= 0;

            const filteredDrops = day.customerDropsList.filter((item) => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return (
                item.customerName?.toLowerCase().includes(q) ||
                item.riderName?.toLowerCase().includes(q) ||
                item.area?.toLowerCase().includes(q) ||
                item.phone?.includes(q)
              );
            });

            const ridersArray = Object.values(day.ridersMap).filter((r) => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return r.riderName?.toLowerCase().includes(q) || r.route?.toLowerCase().includes(q);
            });

            return (
              <div
                key={dateKey}
                className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
              >
                {/* Day Header Bar */}
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm">
                      {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
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
                      <span className="font-medium text-slate-400">Deliveries:</span>
                      <strong className="font-bold font-mono text-slate-900">
                        {day.completedDrops} / {day.totalDrops}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-medium text-slate-400">Cash Collected:</span>
                      <strong className="font-bold font-mono text-emerald-700">
                        + Rs. {day.totalCollected.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-medium text-slate-400">Fuel:</span>
                      <strong className="font-bold font-mono text-amber-700">
                        - Rs. {day.totalFuelCost.toLocaleString()}
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
                        {Math.abs(day.netInflow).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3-Column Daily Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
                  {/* Col 1: Customer Deliveries */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Customer Deliveries</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {day.customerDropsList.length} Deliveries
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total Milk Delivered</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {day.totalVolume.toFixed(1)} L
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total Delivery Bill</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          Rs. {day.totalBilled.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-emerald-700 font-medium">
                          Collected: Rs. {day.totalCollected.toLocaleString()}
                        </span>
                        <span className="font-bold text-amber-700">
                          Due: Rs. {day.totalDue.toLocaleString()}
                        </span>
                      </div>

                      {/* Drop Points List */}
                      {filteredDrops.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Customer Delivery List ({filteredDrops.length})
                          </span>
                          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                            {filteredDrops.map((drop) => (
                              <div
                                key={drop.id}
                                className="flex items-center justify-between text-[11px] text-slate-600 hover:bg-slate-50 p-1.5 rounded transition border border-transparent hover:border-slate-200"
                              >
                                <div className="truncate pr-1">
                                  <span className="font-medium text-slate-800 block truncate">
                                    {drop.customerName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {drop.area} • Rider: <strong className="text-slate-600">{drop.riderName}</strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                                  <div className="text-right">
                                    <span className="font-bold text-slate-900 block">
                                      Rs. {drop.orderTotal.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] text-slate-400">
                                      {drop.quantity}L ({drop.paymentStatus === 'PAID' ? 'Paid' : `Due: ${drop.amountDue}`})
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handlePrintReceipt(drop)}
                                    className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                                    title="View Delivery Slip"
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

                  {/* Col 2: Rider Deliveries & Cash */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <Bike className="w-3.5 h-3.5 text-purple-600" />
                        <span>Rider Deliveries &amp; Cash</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {ridersArray.length} Active Riders
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Active Riders</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {ridersArray.length} Riders Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Deliveries Completed</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {day.completedDrops} / {day.totalDrops} Drops
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-700 font-semibold">Cash Handed to Shop</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          Rs. {day.totalCollected.toLocaleString()}
                        </span>
                      </div>

                      {/* Active Riders Breakdown List */}
                      {ridersArray.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Rider Collections ({ridersArray.length})
                          </span>
                          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                            {ridersArray.map((rider, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[11px] text-slate-600 hover:bg-slate-50 p-1.5 rounded transition border border-transparent hover:border-slate-200"
                              >
                                <div className="truncate pr-1">
                                  <span className="font-medium text-slate-800 block truncate">
                                    {rider.riderName}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {rider.route} • {rider.completedDrops}/{rider.assignedDrops} Drops ({rider.totalVolume.toFixed(1)} L)
                                  </span>
                                </div>
                                <div className="text-right shrink-0 font-mono">
                                  <span className="font-bold text-emerald-700 block">
                                    Rs. {rider.cashCollected.toLocaleString()}
                                  </span>
                                  {rider.salaryPaidToday > 0 ? (
                                    <span className="text-[9px] text-purple-700 font-semibold">
                                      Salary Paid (Rs. {rider.salaryPaidToday.toLocaleString()})
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-slate-400">
                                      Handed Over
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 3: Fuel & Salary Expenses */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <Fuel className="w-3.5 h-3.5 text-amber-600" />
                        <span>Fuel &amp; Salary Expenses</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {day.fuelList.length + day.salaryList.length} Records
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Rider Fuel Expense</span>
                        <span className="font-mono font-bold text-amber-700 text-sm">
                          Rs. {day.totalFuelCost.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Rider Salaries Paid</span>
                        <span className="font-mono font-bold text-purple-700 text-sm">
                          Rs. {day.totalSalariesDisbursed.toLocaleString()}
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
                          {Math.abs(day.netInflow).toLocaleString()}
                        </span>
                      </div>

                      {/* Detailed Vouchers List */}
                      {day.fuelList.length > 0 || day.salaryList.length > 0 ? (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Fuel &amp; Salary Expense List
                          </span>
                          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                            {day.fuelList.map((fItem, idx) => (
                              <div
                                key={`fuel-${idx}`}
                                className="flex items-center justify-between text-[11px] text-slate-600"
                              >
                                <span className="truncate pr-1">⛽ {fItem.riderName} (Fuel)</span>
                                <span className="font-mono font-semibold text-amber-700 shrink-0">
                                  - Rs. {fItem.cost.toLocaleString()}
                                </span>
                              </div>
                            ))}
                            {day.salaryList.map((sItem, idx) => (
                              <div
                                key={`sal-${idx}`}
                                className="flex items-center justify-between text-[11px] text-slate-600"
                              >
                                <span className="truncate pr-1">💼 {sItem.staffName} (Salary)</span>
                                <span className="font-mono font-semibold text-purple-700 shrink-0">
                                  - Rs. {sItem.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pt-2">
                          No fuel or salary expenses recorded for this date.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Bar (Matching Supplier Daily Report) */}
                <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-slate-400">
                    Delivery Status:{' '}
                    <strong className="text-white ml-1 font-mono">
                      {day.completedDrops} Drops Completed • {day.pendingDrops} Pending • {day.totalVolume.toFixed(1)} L Distributed
                    </strong>
                  </span>
                  <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED (COLLECTED: Rs. {day.totalCollected.toLocaleString()} - FUEL: Rs. {day.totalFuelCost.toLocaleString()} - SALARIES: Rs. {day.totalSalariesDisbursed.toLocaleString()} = NET: Rs. {day.netInflow.toLocaleString()})
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Delivery Invoice / Drop Point Receipt */}
      {activeReceiptDrop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <button
              type="button"
              onClick={() => setActiveReceiptDrop(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-dashed border-slate-200">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase bg-slate-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Pure Milk Bar • Delivery Invoice
              </span>
              <h3 className="text-lg font-black text-slate-900">
                DELIVERY RECEIPT
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {activeReceiptDrop.receiptNumber} • {activeReceiptDrop.date} ({activeReceiptDrop.shift})
              </p>
            </div>

            <div className="py-3 space-y-2 text-xs border-b border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{activeReceiptDrop.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone / Address:</span>
                <span className="text-slate-700 text-right max-w-[60%] truncate">
                  {activeReceiptDrop.phone} • {activeReceiptDrop.area}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivering Rider:</span>
                <span className="font-bold text-slate-800">{activeReceiptDrop.riderName}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 text-[10px] uppercase font-bold text-left">
                    <th className="pb-1">Item Description</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Rate</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-mono">
                  {activeReceiptDrop.items.map((item, idx) => (
                    <tr key={idx} className="text-slate-700">
                      <td className="py-1.5 font-sans font-medium">{item.itemName || 'Fresh Milk'}</td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right">Rs. {item.rate || '—'}</td>
                      <td className="py-1.5 text-right font-bold text-slate-900">
                        Rs. {(item.total || (item.quantity * item.rate) || activeReceiptDrop.orderTotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-dashed border-slate-200 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Total Delivery Bill:</span>
                <span className="font-bold text-slate-900">Rs. {activeReceiptDrop.orderTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Cash Paid at Doorstep:</span>
                <span>Rs. {activeReceiptDrop.amountPaid.toLocaleString()}</span>
              </div>
              {activeReceiptDrop.amountDue > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Added to Customer Khata:</span>
                  <span>Rs. {activeReceiptDrop.amountDue.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Print / Close Actions */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setActiveReceiptDrop(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
