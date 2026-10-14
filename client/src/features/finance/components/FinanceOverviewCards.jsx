import React from 'react';
import { Users, Bike, ArrowRight, TrendingUp, Wallet, ShieldCheck, ChevronRight, Receipt, Truck, Tractor, Layers, Droplets, Banknote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerContext } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useRiderSalaryContext } from '@/context/RiderSalaryContext';
import { usePOSContext } from '@/context/POSContext';
import { useExpense } from '@/context/ExpenseContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { useDahiContext } from '@/context/DahiContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { getDateRangeBoundaries, isDateInFilterRange, formatStandardDate, getPktTodayString } from '@/utils/dateUtils';
import { Calendar } from 'lucide-react';

export default function FinanceOverviewCards({ onSelectCustomerFinance, onSelectRiderFinance, onSelectFarmReport, onSelectSupplierReport, onSelectDahiReport, onSelectPos }) {
  const {
    totalKhataReceivable = 0,
    activeAccountsCount = 0,
    withKhataBalCount = 0,
    customers = [],
  } = useCustomerContext();

  const { getAllCustomersAggregates } = useLedgerContext() || {};
  const ledgerAgg = getAllCustomersAggregates ? getAllCustomersAggregates() : null;

  const dynamicTotalDue = (ledgerAgg && ledgerAgg.totalAllDue > 0)
    ? ledgerAgg.totalAllDue
    : totalKhataReceivable;

  const dynamicKhataUsers = (ledgerAgg && ledgerAgg.khataAccountsCount > 0)
    ? ledgerAgg.khataAccountsCount
    : withKhataBalCount;

  const { deliveries = [] } = useDeliveryContext();
  const { staffList = [] } = useDeliveryStaffContext();
  const { salaries = [] } = useRiderSalaryContext();

  const { farmSalesHistory = [], supplierSalesHistory = [], salesHistory = [] } = usePOSContext() || {};
  const { expenses: farmExpensesList = [] } = useExpense() || {};
  const { intakeLogs = [] } = useIntakeContext() || {};
  const { expenses: supplierExpensesList = [] } = useSourcExpenseContext() || {};
  const { batches = [] } = useDahiContext() || {};

  // Date Filter State: 'today' (default) | 'week' | 'month' | 'all' | 'custom'
  const [dateFilter, setDateFilter] = React.useState('today');
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');

  const { detailedLabel: periodLabel } = React.useMemo(() => {
    return getDateRangeBoundaries(dateFilter, customStart, customEnd);
  }, [dateFilter, customStart, customEnd]);

  // Filtered Salaries
  const filteredSalaries = React.useMemo(() => {
    return salaries.filter((s) =>
      isDateInFilterRange(s.paymentDate || s.date || s.createdAt, dateFilter, customStart, customEnd)
    );
  }, [salaries, dateFilter, customStart, customEnd]);
  const totalSalariesPaid = filteredSalaries.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);

  // Live Farm Financial Metrics filtered strictly by selected date range
  const activeFarmSales = React.useMemo(() => {
    const list = farmSalesHistory.length > 0 ? farmSalesHistory : salesHistory;
    return list.filter((s) =>
      isDateInFilterRange(s.date || s.timestamp || s.createdAt, dateFilter, customStart, customEnd)
    );
  }, [farmSalesHistory, salesHistory, dateFilter, customStart, customEnd]);

  const farmSalesRev = activeFarmSales.reduce((acc, sale) => {
    return acc + (sale.items || []).reduce((iAcc, item) => {
      const src = (item.source || '').toLowerCase();
      if (farmSalesHistory.length === 0 && src.includes('supplier')) return iAcc;
      return iAcc + (Number(item.subtotal || item.effectiveRevenue) || 0);
    }, 0);
  }, 0);

  const filteredFarmExpenses = React.useMemo(() => {
    return farmExpensesList.filter((e) =>
      isDateInFilterRange(e.date || e.createdAt, dateFilter, customStart, customEnd)
    );
  }, [farmExpensesList, dateFilter, customStart, customEnd]);
  const farmExpensesTotal = filteredFarmExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const farmNetProfit = farmSalesRev - farmExpensesTotal;

  // Live Supplier Financial Metrics filtered strictly by selected date range
  const activeSupplierSales = React.useMemo(() => {
    const list = supplierSalesHistory.length > 0 ? supplierSalesHistory : salesHistory;
    return list.filter((s) =>
      isDateInFilterRange(s.date || s.timestamp || s.createdAt, dateFilter, customStart, customEnd)
    );
  }, [supplierSalesHistory, salesHistory, dateFilter, customStart, customEnd]);

  const supplierSalesRev = activeSupplierSales.reduce((acc, sale) => {
    return acc + (sale.items || []).reduce((iAcc, item) => {
      const src = (item.source || '').toLowerCase();
      if (supplierSalesHistory.length === 0 && src.includes('farm')) return iAcc;
      return iAcc + (Number(item.subtotal || item.effectiveRevenue) || 0);
    }, 0);
  }, 0);

  const filteredIntakeLogs = React.useMemo(() => {
    return intakeLogs.filter((l) =>
      isDateInFilterRange(l.date || l.createdAt, dateFilter, customStart, customEnd)
    );
  }, [intakeLogs, dateFilter, customStart, customEnd]);
  const supplierPurchasesTotal = filteredIntakeLogs.reduce((sum, l) => sum + (Number(l.totalCost) || 0), 0);

  const filteredSupplierExpenses = React.useMemo(() => {
    return supplierExpensesList.filter((e) =>
      isDateInFilterRange(e.date || e.createdAt, dateFilter, customStart, customEnd)
    );
  }, [supplierExpensesList, dateFilter, customStart, customEnd]);
  const supplierExpensesTotal = filteredSupplierExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const supplierNetProfit = supplierSalesRev - supplierPurchasesTotal - supplierExpensesTotal;

  // Live Dahi Financial Metrics filtered by date
  const filteredBatches = React.useMemo(() => {
    return batches.filter((b) =>
      isDateInFilterRange(b.date || b.createdAt, dateFilter, customStart, customEnd)
    );
  }, [batches, dateFilter, customStart, customEnd]);

  let dahiOutputKg = 0;
  filteredBatches.forEach((b) => {
    dahiOutputKg += Number(b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;
  });

  const filteredAllSales = React.useMemo(() => {
    return salesHistory.filter((s) =>
      isDateInFilterRange(s.date || s.timestamp || s.createdAt, dateFilter, customStart, customEnd)
    );
  }, [salesHistory, dateFilter, customStart, customEnd]);

  let dahiSalesRev = 0;
  filteredAllSales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      if (name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt')) {
        dahiSalesRev += Number(item.subtotal) || ((Number(item.quantity) || 0) * (Number(item.price) || 0));
      }
    });
  });
  const dahiEstimatedMargin = Math.round(dahiSalesRev * 0.25); // value-add profit margin

  return (
    <div className="space-y-4">
      {/* Sleek Minimal Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Financial Operations &amp; Reports
          </h1>
        
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-center">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {[
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="text-[11px] outline-none cursor-pointer"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="text-[11px] outline-none cursor-pointer"
              />
            </div>
          )}

          <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 bg-slate-50 text-slate-600">
            {periodLabel}
          </Badge>

          <button
            type="button"
            onClick={onSelectPos}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200/60 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>POS Sales &amp; Ledger</span>
          </button>
        </div>
      </div>

      {/* Grid: 5 Interactive Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1: Customer Finance */}
        <Card
          onClick={onSelectCustomerFinance}
          className="group relative bg-white border border-slate-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 group-hover:bg-[#00a86b] group-hover:text-white transition-colors duration-200">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Customer Finance
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-emerald-50/70 text-emerald-700 border-emerald-200">
                    Khata &amp; Invoices
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Ledgers, collections, receipts &amp; receivables aging
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 text-center">
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Due</span>
              <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
                Rs. {Number(dynamicTotalDue).toLocaleString()}
              </span>
            </div>
            <div className="border-x border-slate-200/70 px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Accounts</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                {activeAccountsCount || customers.length}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Khata Users</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                {dynamicKhataUsers}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              Khata / Collections / Aging
            </span>
            <span className="font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
              View Ledger <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>

        {/* CARD 2: Rider & Delivery Finance */}
        <Card
          onClick={onSelectRiderFinance}
          className="group relative bg-white border border-slate-200/90 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Rider &amp; Delivery Finance
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-blue-50/70 text-blue-700 border-blue-200">
                    Logistics &amp; Payroll
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Drop point billing, transit fuel &amp; rider salaries
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 text-center">
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Deliveries</span>
              <span className="text-xs font-extrabold text-blue-700 tabular-nums">
                {deliveries.length}
              </span>
            </div>
            <div className="border-x border-slate-200/70 px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Active Riders</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                {staffList.length}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Salaries Paid</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                Rs. {totalSalariesPaid.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Drop Points / Fuel / Payroll
            </span>
            <span className="font-bold text-blue-700 group-hover:underline flex items-center gap-1">
              View Payroll <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>

        {/* CARD 3: Farm Daily Report (Live Sales, Expenses & Profit) */}
        <Card
          onClick={onSelectFarmReport}
          className="group relative bg-white border border-slate-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                <Tractor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Farm Daily Report
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-emerald-50/70 text-emerald-700 border-emerald-200">
                    Farm P&amp;L
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Milking yield, POS farm sales &amp; feed expenses
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 text-center">
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Farm Sales</span>
              <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
                Rs. {farmSalesRev.toLocaleString()}
              </span>
            </div>
            <div className="border-x border-emerald-200/70 px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Expenses</span>
              <span className="text-xs font-bold text-rose-600 tabular-nums">
                Rs. {farmExpensesTotal.toLocaleString()}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Net Profit</span>
              <span className={`text-xs font-bold tabular-nums ${farmNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {farmNetProfit >= 0 ? '+' : '-'} Rs. {Math.abs(farmNetProfit).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              Yield / Sales / Expenses / Net
            </span>
            <span className="font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
              View Farm Report <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>

        {/* CARD 4: Supplier Daily Report (Purchases, POS Sales & Profit) */}
        <Card
          onClick={onSelectSupplierReport}
          className="group relative bg-white border border-slate-200/90 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Supplier Daily Report
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-blue-50/70 text-blue-700 border-blue-200">
                    Supplier P&amp;L
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Milk purchases, supplier POS sales &amp; net profit
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100 text-center">
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Purchases</span>
              <span className="text-xs font-extrabold text-rose-600 tabular-nums">
                Rs. {supplierPurchasesTotal.toLocaleString()}
              </span>
            </div>
            <div className="border-x border-blue-200/70 px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">POS Sales</span>
              <span className="text-xs font-bold text-emerald-700 tabular-nums">
                Rs. {supplierSalesRev.toLocaleString()}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Net Profit</span>
              <span className={`text-xs font-bold tabular-nums ${supplierNetProfit >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                {supplierNetProfit >= 0 ? '+' : '-'} Rs. {Math.abs(supplierNetProfit).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              Purchases / Sales / Sourcing
            </span>
            <span className="font-bold text-blue-700 group-hover:underline flex items-center gap-1">
              View Supplier Report <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>

        {/* CARD 5: Dahi Daily Report (Conversions & POS Sales) */}
        <Card
          onClick={onSelectDahiReport}
          className="group relative bg-white border border-slate-200/90 hover:border-indigo-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    Dahi Daily Report
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-indigo-50/70 text-indigo-700 border-indigo-200">
                    Conversion
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Milk sourcing ratios, POS Dahi sales &amp; margins
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 text-center">
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Produced</span>
              <span className="text-xs font-extrabold text-indigo-700 tabular-nums">
                {dahiOutputKg.toFixed(0)} kg
              </span>
            </div>
            <div className="border-x border-indigo-200/70 px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">POS Sales</span>
              <span className="text-xs font-bold text-emerald-700 tabular-nums">
                Rs. {dahiSalesRev.toLocaleString()}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Value Gain</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                +Rs. {dahiEstimatedMargin.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              Sourcing / Sales / Segregation
            </span>
            <span className="font-bold text-indigo-700 group-hover:underline flex items-center gap-1">
              View Dahi Report <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
