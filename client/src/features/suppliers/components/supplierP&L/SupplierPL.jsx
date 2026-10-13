import React, { useState, useMemo } from 'react';
import { TrendingUp, Download, Calendar, Layers, Droplets, Banknote, Receipt, Truck, Scale, Milk, RefreshCw } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { usePOSContext } from '@/context/POSContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useSettingsContext } from '@/context/SettingsContext';
import { useDailyClose } from '@/context/DailyCloseContext';
import { exportTableToCSV } from '@/utils/csvExport';
import { normalizeDateStr, getActiveBusinessDate } from '@/utils/dateUtils';
import DateHeader from '@/components/common/DateHeader';
import { useGlobalDate } from '@/context/GlobalDateContext';
import { useSupplierPLMetrics } from './useSupplierPLMetrics';
import SupplierPLCards from './SupplierPLCards';
import SupplierPLCharts from './SupplierPLCharts';
import SupplierPLTable from './SupplierPLTable';
import SupplierPLCardDetailSidebar from './SupplierPLCardDetailSidebar';
import ProductChannelBreakdown from './ProductChannelBreakdown';

export default function SupplierPL() {
  const { intakeLogs = [] } = useIntakeContext();
  const { supplierSalesHistory = [], salesHistory = [], products: catalogProducts = [], supplierSalesMetrics } = usePOSContext();
  const { deliveries = [] } = useDeliveryContext();
  const { expenses: allExpenses = [] } = useSourcExpenseContext() || {};
  const { activeDate } = useDailyClose() || {};
  const settingsCtx = useSettingsContext?.();
  const settingsPricing = settingsCtx?.settings?.pricing || {};

  // STRICT RULE: Force initialization to 'Today'
  const { globalDate, setGlobalDate } = useGlobalDate();
  const [selectedDate, setSelectedDate] = useState(() => globalDate || new Date().toISOString().split('T')[0]);
  const [periodFilter, setPeriodFilter] = useState('Today'); // 'Today' | 'This Month' | 'All Time' | 'Custom Range'
  const [customDate, setCustomDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    if (globalDate) {
      setSelectedDate(globalDate);
    }
  }, [globalDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setGlobalDate(newDate);
    if (newDate === new Date().toISOString().split('T')[0]) {
      setPeriodFilter('Today');
      setCustomDate('');
    } else {
      setPeriodFilter('Custom');
      setCustomDate(newDate);
    }
  };

  // Active Drawers / Slide-overs state
  const [activeCardDetail, setActiveCardDetail] = useState(null); // 'cost' | 'volume' | 'paid' | 'due' | 'rate' | 'income' | null
  const [selectedProductRow, setSelectedProductRow] = useState(null); // product object | null

  // 1. Filter Records strictly by Selected Date / Period
  const todayStr = selectedDate;
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

  const filteredIntakeLogs = useMemo(() => {
    if (periodFilter === 'Custom Range' || startDate || endDate) {
      return intakeLogs.filter((item) => {
        const iDate = (item.date || '').slice(0, 10);
        if (startDate && iDate < startDate) return false;
        if (endDate && iDate > endDate) return false;
        if (customDate && !startDate && !endDate) return iDate === customDate;
        return true;
      });
    }
    if (customDate) {
      return intakeLogs.filter((item) => normalizeDateStr(item.date || item.createdAt) === customDate);
    }
    if (periodFilter === 'Today') {
      return intakeLogs.filter((item) => normalizeDateStr(item.date || item.createdAt) === todayStr);
    }
    if (periodFilter === 'This Month') {
      return intakeLogs.filter((item) => (normalizeDateStr(item.date || item.createdAt) || '').startsWith(currentMonthStr));
    }
    return intakeLogs;
  }, [intakeLogs, customDate, startDate, endDate, periodFilter, todayStr, currentMonthStr]);

  const activeSupplierSales = supplierSalesHistory;
  const filteredSales = useMemo(() => {
    return activeSupplierSales.filter((sale) => {
      const sDate = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt || sale.formattedDate);
      if (periodFilter === 'Custom Range' || startDate || endDate) {
        if (startDate && sDate < startDate) return false;
        if (endDate && sDate > endDate) return false;
        if (customDate && !startDate && !endDate) return sDate === customDate;
        return true;
      }
      if (customDate) return sDate === customDate;
      if (periodFilter === 'Today') return sDate === todayStr;
      if (periodFilter === 'This Month') return sDate.startsWith(currentMonthStr);
      return true;
    });
  }, [activeSupplierSales, customDate, startDate, endDate, periodFilter, todayStr, currentMonthStr]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => {
      const eDate = normalizeDateStr(e.date || e.createdAt);
      if (periodFilter === 'Custom Range' || startDate || endDate) {
        if (startDate && eDate < startDate) return false;
        if (endDate && eDate > endDate) return false;
        if (customDate && !startDate && !endDate) return eDate === customDate;
        return true;
      }
      if (customDate) return eDate === customDate;
      if (periodFilter === 'Today') return eDate === todayStr;
      if (periodFilter === 'This Month') return eDate.startsWith(currentMonthStr);
      return true;
    });
  }, [allExpenses, customDate, startDate, endDate, periodFilter, todayStr, currentMonthStr]);

  // 2. Metrics & Streams computation via custom hook (modularized)
  const {
    supplierMilkSales,
    supplierMilkVolume,
    supplierDahiSales,
    supplierDahiVolume,
    totalSupplierSales,
    productStreams,
    summaryData,
    barChartData,
    donutChartData,
  } = useSupplierPLMetrics({
    filteredIntakeLogs,
    filteredSales,
    filteredExpenses,
    supplierSalesMetrics,
  });

  // 6. CSV Export Functionality
  const handleExportCSV = () => {
    const headers = [
      'Product Stream',
      'Category',
      'Supply Source',
      'Sourced Volume (L)',
      'Amount Paid (Rs)',
      'Pending Balance (Rs)',
      'Realized Resale (Rs)',
      'Net Profit (Rs)',
    ];

    const rows = productStreams.map((p) => [
      p.streamName,
      p.category,
      p.sourceType,
      p.sourcedVolume,
      `Rs. ${Number(p.paidAmount || 0).toLocaleString()}`,
      `Rs. ${Number(p.pendingAmount || 0).toLocaleString()}`,
      `Rs. ${Number(p.resaleRevenue || 0).toLocaleString()}`,
      `Rs. ${Number((p.resaleRevenue || 0) - (p.baseCost || 0)).toLocaleString()}`,
    ]);

    exportTableToCSV({
      filename: `Supplier_Procurement_Report_${new Date().toISOString().split('T')[0]}`,
      title: 'Supplier Milk Procurement Report',
      metadata: [
        ['Period Filter', customDate ? `Date: ${customDate}` : periodFilter],
        ['Total Procured Volume', `${summaryData.totalVolume} L`],
        ['Total Paid to Suppliers', `Rs. ${summaryData.paidSpend}`],
        ['Supplier Balance Due', `Rs. ${summaryData.pendingSpend}`],
        ['Realized Sales Revenue', `Rs. ${summaryData.income}`],
        ['Net Realized Profit', `Rs. ${summaryData.net}`],
      ],
      headers,
      rows,
      summaryRows: [
        ['TOTAL SUMMARY', '', '', `${summaryData.totalVolume} L`, `Rs. ${summaryData.cost}`, `Rs. ${summaryData.avgPurchaseRate.toFixed(1)}/L`, `Rs. ${summaryData.paidSpend}`, `Rs. ${summaryData.pendingSpend}`, `Rs. ${summaryData.income}`],
      ],
    });
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* DateHeader at Top of Supplier P&L */}
      <DateHeader
        date={selectedDate}
        setDate={handleDateChange}
        title="Supplier Procurement Profit & Loss (P&L)"
        subtitle={`Milk procurement cost, processing margins, and resale profit strictly for ${selectedDate}`}
      />

      {/* 1. Page Header with Title and Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            Supplier Procurement Profit &amp; Loss (P&amp;L)
          </h2>
          
        </div>

        {/* Toolbar matching user's exact screenshot design */}
        <div className="flex flex-wrap items-center gap-2">
          {/* A. Period Segmented Pills */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            {['All Time', 'Today', 'This Month', 'Custom Range'].map((period) => {
              const isActive = periodFilter === period && !customDate && !startDate && !endDate;
              const isCustomActive = period === 'Custom Range' && (periodFilter === 'Custom Range' || startDate || endDate || customDate);
              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => {
                    setPeriodFilter(period);
                    if (period !== 'Custom Range') {
                      setCustomDate('');
                      setStartDate('');
                      setEndDate('');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    (period === 'Custom Range' ? isCustomActive : isActive)
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period}
                </button>
              );
            })}
          </div>

          {/* B. Date Range / Custom Date Picker inputs */}
          {(periodFilter === 'Custom Range' || startDate || endDate || customDate) && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 h-9 text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#0092b8] shrink-0" />
              <span className="text-slate-400 font-medium text-[11px]">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCustomDate('');
                  setPeriodFilter('Custom Range');
                }}
                className="bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 cursor-pointer"
              />
              <span className="text-slate-400 font-medium text-[11px]">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCustomDate('');
                  setPeriodFilter('Custom Range');
                }}
                className="bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 cursor-pointer"
              />
              {(startDate || endDate || customDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCustomDate('');
                    setPeriodFilter('All Time');
                  }}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* C. Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full text-white text-xs font-bold bg-[#009966] hover:bg-[#008055] transition-all shadow-xs hover:shadow-sm active:translate-y-0 cursor-pointer"
            title="Export full P&L report as CSV"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export P&amp;L Report CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Cards (6 Cards) */}
      <SupplierPLCards
        summaryData={summaryData}
        onSelectCard={(cardType) => setActiveCardDetail(cardType)}
      />

      {/* Dahi Value-Add Section (Identical to Farm P&L logic) */}
      {supplierSalesMetrics && supplierSalesMetrics.milkCostTransferred > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Supplier Dahi Value-Add (Processing Analysis)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                supplierSalesMetrics.dahiNetProfit >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {supplierSalesMetrics.dahiNetProfit >= 0 ? 'Profitable' : 'Loss-Making'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200/70 bg-blue-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Dahi Value-Add (Processing Analysis)
                  </h3>
                </div>
              </div>
              <p className={`text-lg font-black tabular ${supplierSalesMetrics.dahiNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {supplierSalesMetrics.dahiNetProfit >= 0 ? 'Profit' : 'Loss'} Rs. {Math.abs(supplierSalesMetrics.dahiNetProfit).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-blue-200/50 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-blue-100/60 bg-white/40 px-2 rounded font-semibold">
                <span className="text-slate-700">Total Realized Dahi Sales</span>
                <span className="font-bold text-emerald-700 tabular">+ Rs. {Math.round(supplierSalesMetrics.dahiRevenue).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Charts Component (Bar Chart & Donut Chart) */}
      <SupplierPLCharts
        barData={barChartData}
        donutData={donutChartData}
      />

      {/* 4. Filter & Table Component */}
      <SupplierPLTable
        products={productStreams}
        onSelectRow={(product) => setSelectedProductRow(product)}
      />

      {/* 5. Slide-Over: Card Detail Sidebar (when any summary card is clicked) */}
      {activeCardDetail && (
        <SupplierPLCardDetailSidebar
          cardType={activeCardDetail}
          summaryData={summaryData}
          onClose={() => setActiveCardDetail(null)}
        />
      )}

      {/* 6. Slide-Over: Product Channel Breakdown Sidebar (when any table row is clicked) */}
      {selectedProductRow && (
        <ProductChannelBreakdown
          product={selectedProductRow}
          onClose={() => setSelectedProductRow(null)}
        />
      )}
    </div>
  );
}
