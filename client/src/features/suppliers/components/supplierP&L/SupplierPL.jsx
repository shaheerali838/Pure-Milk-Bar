import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Droplets,
  DollarSign,
  Receipt,
  Truck,
  Scale,
  Milk,
  RefreshCw,
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { usePOSContext } from '@/context/POSContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useSettingsContext } from '@/context/SettingsContext';
import { exportTableToCSV } from '@/utils/csvExport';
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
  const settingsCtx = useSettingsContext?.();
  const settingsPricing = settingsCtx?.settings?.pricing || {};

  // Top-right Date/Period filter states
  const [periodFilter, setPeriodFilter] = useState('All Time'); // 'All Time' | 'Today' | 'This Month' | 'Custom Range'
  const [customDate, setCustomDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active Drawers / Slide-overs state
  const [activeCardDetail, setActiveCardDetail] = useState(null); // 'cost' | 'volume' | 'paid' | 'due' | 'rate' | 'income' | null
  const [selectedProductRow, setSelectedProductRow] = useState(null); // product object | null

  // 1. Filter Records by Selected Date / Period
  const todayStr = new Date().toISOString().split('T')[0];
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
      return intakeLogs.filter((item) => item.date === customDate);
    }
    if (periodFilter === 'Today') {
      return intakeLogs.filter((item) => item.date === todayStr);
    }
    if (periodFilter === 'This Month') {
      return intakeLogs.filter((item) => (item.date || '').startsWith(currentMonthStr));
    }
    return intakeLogs;
  }, [intakeLogs, customDate, startDate, endDate, periodFilter, todayStr, currentMonthStr]);

  const activeSupplierSales = supplierSalesHistory;
  const filteredSales = useMemo(() => {
    return activeSupplierSales.filter((sale) => {
      let sDate = '';
      if (sale.date && /^\d{4}-\d{2}-\d{2}/.test(sale.date)) {
        sDate = sale.date.slice(0, 10);
      } else if (sale.timestamp && /^\d{4}-\d{2}-\d{2}/.test(sale.timestamp)) {
        sDate = sale.timestamp.slice(0, 10);
      } else if (sale.createdAt && /^\d{4}-\d{2}-\d{2}/.test(sale.createdAt)) {
        sDate = sale.createdAt.slice(0, 10);
      } else {
        const raw = sale.date || sale.timestamp || sale.createdAt || sale.formattedDate || '';
        if (raw) {
          const parsed = new Date(raw);
          if (!isNaN(parsed.getTime())) {
            try {
              sDate = parsed.toISOString().split('T')[0];
            } catch {
              sDate = '';
            }
          }
        }
      }
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
    if (periodFilter === 'Custom Range' || startDate || endDate) {
      return allExpenses.filter((e) => {
        const eDate = (e.date || '').slice(0, 10);
        if (startDate && eDate < startDate) return false;
        if (endDate && eDate > endDate) return false;
        if (customDate && !startDate && !endDate) return eDate === customDate;
        return true;
      });
    }
    if (customDate) {
      return allExpenses.filter((e) => e.date === customDate);
    }
    if (periodFilter === 'Today') {
      return allExpenses.filter((e) => e.date === todayStr);
    }
    if (periodFilter === 'This Month') {
      return allExpenses.filter((e) => (e.date || '').startsWith(currentMonthStr));
    }
    return allExpenses;
  }, [allExpenses, customDate, startDate, endDate, periodFilter, todayStr, currentMonthStr]);

  // Compute Supplier Milk and Dahi Sales strictly isolated from filtered sales
  const { supplierMilkSales, supplierMilkVolume, supplierDahiSales, supplierDahiVolume, totalSupplierSales } = useMemo(() => {
    let mSales = 0;
    let mVol = 0;
    let dSales = 0;
    let dVol = 0;

    filteredSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const iName = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price || item.unitPrice) || 0));

        const isDahi = iName.includes('dahi') || cat.includes('dahi') || iName.includes('yogurt') || cat.includes('yogurt');
        if (isDahi) {
          dSales += sub;
          dVol += qty;
        } else {
          mSales += sub;
          mVol += qty;
        }
      });
    });

    return {
      supplierMilkSales: mSales,
      supplierMilkVolume: mVol,
      supplierDahiSales: dSales,
      supplierDahiVolume: dVol,
      totalSupplierSales: mSales + dSales,
    };
  }, [filteredSales]);

  // 2. Real Milk Procurement Streams Dynamically From Intake Records
  const productStreams = useMemo(() => {
    const buffaloLogs = [...filteredIntakeLogs];

    // Real Sourced Volumes (Liters) from IntakeContext
    const buffaloVolume = buffaloLogs.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

    // Real Base Sourcing Costs (Rs.) from IntakeContext
    const buffaloCost = buffaloLogs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);

    // Real Payments & Pending Balances
    const buffaloPaid = buffaloLogs.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
    const buffaloPending = buffaloLogs.reduce((sum, r) => sum + (Number(r.pendingAmount) || 0), 0);

    const buildIntakeChannels = (logs, totalVol, totalCostVal) => {
      const morningLogs = logs.filter((l) => (l.shift || '').toLowerCase().includes('morning') || (l.time || '').toLowerCase().includes('morning'));
      const eveningLogs = logs.filter((l) => (l.shift || '').toLowerCase().includes('evening') || (l.time || '').toLowerCase().includes('evening'));
      const otherLogs = logs.filter((l) => !morningLogs.includes(l) && !eveningLogs.includes(l));

      const mVol = morningLogs.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
      const mCost = morningLogs.reduce((s, l) => s + (Number(l.totalCost) || 0), 0);
      const eVol = eveningLogs.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
      const eCost = eveningLogs.reduce((s, l) => s + (Number(l.totalCost) || 0), 0);
      const oVol = otherLogs.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
      const oCost = otherLogs.reduce((s, l) => s + (Number(l.totalCost) || 0), 0);

      const channels = [];
      if (mVol > 0 || logs.length === 0) {
        channels.push({
          channelName: 'Morning Shift Procurement',
          channelSubtext: 'Direct morning dock intake batches',
          volume: mVol,
          cost: mCost,
          avgRate: mVol > 0 ? Math.round(mCost / mVol) : 0,
          sharePercent: totalVol > 0 ? Math.round((mVol / totalVol) * 100) : 0,
          revenue: 0,
          grossMargin: 0,
        });
      }
      if (eVol > 0) {
        channels.push({
          channelName: 'Evening Shift Procurement',
          channelSubtext: 'Evening collection route dock intake',
          volume: eVol,
          cost: eCost,
          avgRate: eVol > 0 ? Math.round(eCost / eVol) : 0,
          sharePercent: totalVol > 0 ? Math.round((eVol / totalVol) * 100) : 0,
          revenue: 0,
          grossMargin: 0,
        });
      }
      if (oVol > 0) {
        channels.push({
          channelName: 'Special / Direct Sourcing',
          channelSubtext: 'Spot intake batches and tanker deliveries',
          volume: oVol,
          cost: oCost,
          avgRate: oVol > 0 ? Math.round(oCost / oVol) : 0,
          sharePercent: totalVol > 0 ? Math.round((oVol / totalVol) * 100) : 0,
          revenue: 0,
          grossMargin: 0,
        });
      }
      if (channels.length === 0) {
        channels.push({
          channelName: 'Standard Milk Intake',
          channelSubtext: 'Supplier intake batches',
          volume: totalVol,
          cost: totalCostVal,
          avgRate: totalVol > 0 ? Math.round(totalCostVal / totalVol) : 0,
          sharePercent: 100,
          revenue: 0,
          grossMargin: 0,
        });
      }
      return channels;
    };

    const streams = [
      {
        id: 'LINE-BUF-02',
        streamName: 'Sourced Buffalo Milk',
        category: 'Raw Sourced Milk',
        sourceType: 'Supplier Milk Procurement',
        originDetails: 'Direct Supplier Intake & High-Fat Sourcing',
        sourcedVolume: buffaloVolume,
        unit: 'L',
        baseCost: buffaloCost,
        paidAmount: buffaloPaid,
        pendingAmount: buffaloPending,
        avgPurchaseRate: buffaloVolume > 0 ? buffaloCost / buffaloVolume : 0,
        resaleRevenue: supplierMilkSales,
        soldVolume: supplierMilkVolume,
        avgResaleRate: supplierMilkVolume > 0 ? Math.round(supplierMilkSales / supplierMilkVolume) : 0,
        grossMargin: supplierMilkSales - buffaloCost,
        grossMarginPercent: supplierMilkSales > 0 ? Math.round(((supplierMilkSales - buffaloCost) / supplierMilkSales) * 100) : 0,
        allocatedOverhead: 0,
        netProfit: supplierMilkSales - buffaloCost,
        realizationPerUnit: buffaloVolume > 0 ? buffaloCost / buffaloVolume : 0,
        channels: buildIntakeChannels(buffaloLogs, buffaloVolume, buffaloCost),
        logsCount: buffaloLogs.length,
      },
    ];

    if (supplierDahiSales > 0 || supplierDahiVolume > 0) {
      streams.push({
        id: 'LINE-DAHI-SUP',
        streamName: 'Supplier & Mixed Dahi (Supplier Share)',
        category: 'Processed & Chilled',
        sourceType: 'Dahi Value Addition',
        originDetails: 'Supplier-Sourced & Mixed Batch Dahi Conversion',
        sourcedVolume: supplierDahiVolume,
        unit: 'kg',
        baseCost: 0,
        paidAmount: 0,
        pendingAmount: 0,
        avgPurchaseRate: 0,
        resaleRevenue: supplierDahiSales,
        soldVolume: supplierDahiVolume,
        avgResaleRate: supplierDahiVolume > 0 ? Math.round(supplierDahiSales / supplierDahiVolume) : 320,
        grossMargin: supplierDahiSales - (supplierSalesMetrics?.dahiProductionCost || 0),
        grossMarginPercent: supplierDahiSales > 0 ? Math.round(((supplierDahiSales - (supplierSalesMetrics?.dahiProductionCost || 0)) / supplierDahiSales) * 100) : 0,
        allocatedOverhead: 0,
        netProfit: supplierDahiSales - (supplierSalesMetrics?.dahiProductionCost || 0),
        realizationPerUnit: supplierDahiVolume > 0 ? Math.round((supplierDahiSales - (supplierSalesMetrics?.dahiProductionCost || 0)) / supplierDahiVolume) : 0,
        channels: [
          {
            channelName: 'POS Counter & Delivery Dahi Sales',
            channelSubtext: 'Supplier portion of Dahi sales',
            volume: supplierDahiVolume,
            cost: 0,
            avgRate: 0,
            sharePercent: 100,
            revenue: supplierDahiSales,
            grossMargin: supplierDahiSales,
          },
        ],
        logsCount: 1,
      });
    }

    return streams;
  }, [filteredIntakeLogs, supplierMilkSales, supplierMilkVolume, supplierDahiSales, supplierDahiVolume]);

  // 3. Aggregate Summary Data for the Cards
  // CRITICAL FORMULA: (Supplier Milk Sales + Supplier Dahi Sales) - Supplier Purchase Cost - Supplier Expenses = Supplier Net Profit
  const summaryData = useMemo(() => {
    const totalVolume = filteredIntakeLogs.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    const totalSupplierCost = filteredIntakeLogs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
    const totalPaid = filteredIntakeLogs.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
    const totalPending = filteredIntakeLogs.reduce((sum, r) => sum + (Number(r.pendingAmount) || 0), 0);
    const totalRealizedSales = totalSupplierSales;
    const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const supplierNetProfit = totalSupplierSales - totalSupplierCost - totalExpenses;
    const totalGross = totalSupplierSales - totalSupplierCost;

    const avgPurchaseRate = totalVolume > 0 ? totalSupplierCost / totalVolume : 0;
    const avgResalePerLiter = supplierMilkVolume > 0 ? supplierMilkSales / supplierMilkVolume : 0;
    const grossMarginPercent = totalRealizedSales > 0 ? Math.round((totalGross / totalRealizedSales) * 100) : 0;

    return {
      income: totalRealizedSales,
      cost: totalSupplierCost,
      gross: totalGross,
      logistics: totalExpenses,
      net: supplierNetProfit,
      realizationPerLiter: avgPurchaseRate,
      totalVolume,
      buffaloVolume: totalVolume,
      avgPurchaseRate,
      avgResalePerLiter,
      overheadPerLiter: totalVolume > 0 ? totalExpenses / totalVolume : 0,
      grossMarginPercent,
      netMarginPercent: totalRealizedSales > 0 ? Math.round((supplierNetProfit / totalRealizedSales) * 100) : 0,
      paidSpend: totalPaid,
      pendingSpend: totalPending,
      realSoldVolume: supplierMilkVolume,
      dahiSoldVolume: supplierDahiVolume,
      milkSales: supplierMilkSales,
      dahiSales: supplierDahiSales,
      products: productStreams,
      intakeRecords: filteredIntakeLogs,
      expenses: filteredExpenses,
      expenseVouchersCount: filteredExpenses.length,
    };
  }, [productStreams, filteredIntakeLogs, filteredExpenses, totalSupplierSales, supplierMilkSales, supplierDahiSales, supplierMilkVolume, supplierDahiVolume]);

  // 4. Data for Bar Chart ('Procurement Cost & Volume by Stream')
  const barChartData = useMemo(() => {
    return productStreams.map((p) => ({
      name: p.streamName.replace('Sourced ', '').replace('Standardized ', ''),
      fullName: p.streamName,
      baseCost: p.baseCost,
      sourcedVolume: p.sourcedVolume,
      resaleRevenue: p.resaleRevenue,
      grossMargin: p.grossMargin,
    }));
  }, [productStreams]);

  // 5. Data for Donut Chart ('Sales Revenue Allocation')
  const donutChartData = useMemo(() => {
    return productStreams
      .filter((p) => p.resaleRevenue > 0)
      .map((p) => ({
        name: p.streamName,
        value: p.resaleRevenue,
      }));
  }, [productStreams]);

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
          <div className="flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/70">
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
                  className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    (period === 'Custom Range' ? isCustomActive : isActive)
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
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
