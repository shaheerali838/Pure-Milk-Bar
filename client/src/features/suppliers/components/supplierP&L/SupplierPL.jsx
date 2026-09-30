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
  const { salesHistory = [], products: catalogProducts = [] } = usePOSContext();
  const { deliveries = [] } = useDeliveryContext();
  const settingsCtx = useSettingsContext?.();
  const settingsPricing = settingsCtx?.settings?.pricing || {};

  // Top-right Date/Period filter states
  const [periodFilter, setPeriodFilter] = useState('All Time'); // 'All Time' | 'Today' | 'This Month'
  const [customDate, setCustomDate] = useState('');

  // Active Drawers / Slide-overs state
  const [activeCardDetail, setActiveCardDetail] = useState(null); // 'cost' | 'volume' | 'paid' | 'due' | 'rate' | 'income' | null
  const [selectedProductRow, setSelectedProductRow] = useState(null); // product object | null

  // 1. Filter Records by Selected Date / Period
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

  const filteredIntakeLogs = useMemo(() => {
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
  }, [intakeLogs, customDate, periodFilter, todayStr, currentMonthStr]);

  const filteredSales = useMemo(() => {
    if (customDate) {
      return salesHistory.filter((sale) => {
        const sDate = sale.formattedDate
          ? new Date(sale.formattedDate).toISOString().split('T')[0]
          : (sale.timestamp ? sale.timestamp.split('T')[0] : (sale.date || ''));
        return sDate === customDate;
      });
    }
    if (periodFilter === 'Today') {
      return salesHistory.filter((sale) => {
        const sDate = sale.formattedDate
          ? new Date(sale.formattedDate).toISOString().split('T')[0]
          : (sale.timestamp ? sale.timestamp.split('T')[0] : (sale.date || ''));
        return sDate === todayStr;
      });
    }
    if (periodFilter === 'This Month') {
      return salesHistory.filter((sale) => {
        const sDate = sale.formattedDate
          ? new Date(sale.formattedDate).toISOString().split('T')[0]
          : (sale.timestamp ? sale.timestamp.split('T')[0] : (sale.date || ''));
        return sDate.startsWith(currentMonthStr);
      });
    }
    return salesHistory;
  }, [salesHistory, customDate, periodFilter, todayStr, currentMonthStr]);

  // 2. Real Milk Procurement Streams Dynamically From Intake Records (NO CREAM, NO EXPENSES)
  const productStreams = useMemo(() => {
    // Separate intake logs by stream criteria
    const cowLogs = filteredIntakeLogs.filter(
      (i) =>
        (i.milkType && i.milkType.toLowerCase().includes('cow')) ||
        (i.notes && i.notes.toLowerCase().includes('cow')) ||
        (i.supplierName && i.supplierName.toLowerCase().includes('chaudhry')) ||
        (i.fat !== undefined && Number(i.fat) < 5.0)
    );

    const buffaloLogs = filteredIntakeLogs.filter(
      (i) =>
        !cowLogs.includes(i) && (
          (i.milkType && (i.milkType.toLowerCase().includes('buffalo') || i.milkType.toLowerCase().includes('buff'))) ||
          (i.notes && i.notes.toLowerCase().includes('buffalo')) ||
          (i.supplierName && i.supplierName.toLowerCase().includes('ahmad')) ||
          (i.fat !== undefined && Number(i.fat) >= 6.0)
        )
    );

    const chilledLogs = filteredIntakeLogs.filter(
      (i) => !cowLogs.includes(i) && !buffaloLogs.includes(i)
    );

    // Real Sourced Volumes (Liters) from IntakeContext
    const cowVolume = cowLogs.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    const buffaloVolume = buffaloLogs.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    const chilledVolume = chilledLogs.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

    // Real Base Sourcing Costs (Rs.) from IntakeContext
    const cowCost = cowLogs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
    const buffaloCost = buffaloLogs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
    const chilledCost = chilledLogs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);

    // Real Payments & Pending Balances
    const cowPaid = cowLogs.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
    const buffaloPaid = buffaloLogs.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
    const chilledPaid = chilledLogs.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);

    const cowPending = cowLogs.reduce((sum, r) => sum + (Number(r.pendingAmount) || 0), 0);
    const buffaloPending = buffaloLogs.reduce((sum, r) => sum + (Number(r.pendingAmount) || 0), 0);
    const chilledPending = chilledLogs.reduce((sum, r) => sum + (Number(r.pendingAmount) || 0), 0);

    // Real Sales recorded for Supplier Milk from POS orders (if any)
    const getRealSalesForStream = (keywords) => {
      let revenue = 0;
      let volume = 0;
      filteredSales.forEach((sale) => {
        (sale.items || []).forEach((item) => {
          const iName = (item.name || '').toLowerCase();
          const src = item.source || '';
          const matches = keywords.some((kw) => iName.includes(kw));
          if (matches && (src === 'Supplier' || iName.includes('supplier') || iName.includes('buffalo'))) {
            const qty = Number(item.quantity) || 0;
            const sub = Number(item.subtotal) || qty * (Number(item.price || item.unitPrice) || 0);
            revenue += sub;
            volume += qty;
          }
        });
      });
      return { revenue, volume };
    };

    const cowSales = getRealSalesForStream(['cow']);
    const buffaloSales = getRealSalesForStream(['buffalo', 'buff']);
    const chilledSales = getRealSalesForStream(['chilled', 'tanker', 'pasteurized']);

    // Build real shift breakdown for intake channels
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
        id: 'LINE-COW-01',
        streamName: 'Sourced Cow Milk',
        category: 'Raw Sourced Milk',
        sourceType: 'Supplier Milk Procurement',
        originDetails: 'Direct Supplier Intake & Collection Routes',
        sourcedVolume: cowVolume,
        unit: 'L',
        baseCost: cowCost,
        paidAmount: cowPaid,
        pendingAmount: cowPending,
        avgPurchaseRate: cowVolume > 0 ? cowCost / cowVolume : 0,
        resaleRevenue: cowSales.revenue,
        soldVolume: cowSales.volume,
        avgResaleRate: cowSales.volume > 0 ? Math.round(cowSales.revenue / cowSales.volume) : 0,
        grossMargin: Math.max(0, cowSales.revenue - (cowSales.volume * (cowVolume > 0 ? cowCost / cowVolume : 0))),
        grossMarginPercent: cowSales.revenue > 0 ? Math.round(((cowSales.revenue - (cowSales.volume * (cowCost / cowVolume))) / cowSales.revenue) * 100) : 0,
        allocatedOverhead: 0,
        netProfit: Math.max(0, cowSales.revenue - (cowSales.volume * (cowVolume > 0 ? cowCost / cowVolume : 0))),
        realizationPerUnit: cowVolume > 0 ? cowCost / cowVolume : 0,
        channels: buildIntakeChannels(cowLogs, cowVolume, cowCost),
        logsCount: cowLogs.length,
      },
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
        resaleRevenue: buffaloSales.revenue,
        soldVolume: buffaloSales.volume,
        avgResaleRate: buffaloSales.volume > 0 ? Math.round(buffaloSales.revenue / buffaloSales.volume) : 0,
        grossMargin: Math.max(0, buffaloSales.revenue - (buffaloSales.volume * (buffaloVolume > 0 ? buffaloCost / buffaloVolume : 0))),
        grossMarginPercent: buffaloSales.revenue > 0 ? Math.round(((buffaloSales.revenue - (buffaloSales.volume * (buffaloCost / buffaloVolume))) / buffaloSales.revenue) * 100) : 0,
        allocatedOverhead: 0,
        netProfit: Math.max(0, buffaloSales.revenue - (buffaloSales.volume * (buffaloVolume > 0 ? buffaloCost / buffaloVolume : 0))),
        realizationPerUnit: buffaloVolume > 0 ? buffaloCost / buffaloVolume : 0,
        channels: buildIntakeChannels(buffaloLogs, buffaloVolume, buffaloCost),
        logsCount: buffaloLogs.length,
      },
    ];

    if (chilledVolume > 0) {
      streams.push({
        id: 'LINE-CHL-03',
        streamName: 'Standardized Chilled Milk',
        category: 'Processed & Chilled',
        sourceType: 'Bulk Intake Sourcing',
        originDetails: 'Chilled Milk Sourcing & Tankers',
        sourcedVolume: chilledVolume,
        unit: 'L',
        baseCost: chilledCost,
        paidAmount: chilledPaid,
        pendingAmount: chilledPending,
        avgPurchaseRate: chilledVolume > 0 ? chilledCost / chilledVolume : 0,
        resaleRevenue: chilledSales.revenue,
        soldVolume: chilledSales.volume,
        avgResaleRate: chilledSales.volume > 0 ? Math.round(chilledSales.revenue / chilledSales.volume) : 0,
        grossMargin: Math.max(0, chilledSales.revenue - (chilledSales.volume * (chilledVolume > 0 ? chilledCost / chilledVolume : 0))),
        grossMarginPercent: chilledSales.revenue > 0 ? Math.round(((chilledSales.revenue - (chilledSales.volume * (chilledCost / chilledVolume))) / chilledSales.revenue) * 100) : 0,
        allocatedOverhead: 0,
        netProfit: Math.max(0, chilledSales.revenue - (chilledSales.volume * (chilledVolume > 0 ? chilledCost / chilledVolume : 0))),
        realizationPerUnit: chilledVolume > 0 ? chilledCost / chilledVolume : 0,
        channels: buildIntakeChannels(chilledLogs, chilledVolume, chilledCost),
        logsCount: chilledLogs.length,
      });
    }

    return streams;
  }, [filteredIntakeLogs, filteredSales]);

  // 3. Aggregate Summary Data for the 6 Cards
  const summaryData = useMemo(() => {
    const totalVolume = productStreams.reduce((acc, p) => acc + (p.sourcedVolume || 0), 0);
    const totalSupplierCost = productStreams.reduce((acc, p) => acc + (p.baseCost || 0), 0);
    const totalPaid = productStreams.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
    const totalPending = productStreams.reduce((acc, p) => acc + (p.pendingAmount || 0), 0);
    const totalRealizedSales = productStreams.reduce((acc, p) => acc + (p.resaleRevenue || 0), 0);
    const totalRealSoldVolume = productStreams.reduce((acc, p) => acc + (p.soldVolume || 0), 0);
    const totalGross = Math.max(0, productStreams.reduce((acc, p) => acc + (p.grossMargin || 0), 0));

    const avgPurchaseRate = totalVolume > 0 ? totalSupplierCost / totalVolume : 0;
    const avgResalePerLiter = totalRealSoldVolume > 0 ? totalRealizedSales / totalRealSoldVolume : 0;
    const grossMarginPercent = totalRealizedSales > 0 ? Math.round((totalGross / totalRealizedSales) * 100) : 0;

    const cowStream = productStreams.find((p) => p.id === 'LINE-COW-01');
    const buffStream = productStreams.find((p) => p.id === 'LINE-BUF-02');

    return {
      income: totalRealizedSales,
      cost: totalSupplierCost,
      gross: totalGross,
      logistics: 0,
      net: totalGross,
      realizationPerLiter: avgPurchaseRate,
      totalVolume,
      cowVolume: cowStream?.sourcedVolume || 0,
      buffaloVolume: buffStream?.sourcedVolume || 0,
      avgPurchaseRate,
      avgResalePerLiter,
      overheadPerLiter: 0,
      grossMarginPercent,
      netMarginPercent: grossMarginPercent,
      paidSpend: totalPaid,
      pendingSpend: totalPending,
      realSoldVolume: totalRealSoldVolume,
      products: productStreams,
      intakeRecords: filteredIntakeLogs,
      expenses: [],
      expenseVouchersCount: 0,
    };
  }, [productStreams, filteredIntakeLogs]);

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

  // 5. Data for Donut Chart ('Procurement Cost Allocation')
  const donutChartData = useMemo(() => {
    return productStreams
      .filter((p) => p.baseCost > 0)
      .map((p) => ({
        name: p.streamName,
        value: p.baseCost,
      }));
  }, [productStreams]);

  // 6. CSV Export Functionality
  const handleExportCSV = () => {
    const headers = [
      'Product Stream',
      'Category',
      'Supply Source',
      'Sourced Volume (L)',
      'Procurement Cost (Rs)',
      'Avg Purchase Rate (Rs/L)',
      'Amount Paid (Rs)',
      'Pending Balance (Rs)',
      'Realized Resale (Rs)',
    ];

    const rows = productStreams.map((p) => [
      p.streamName,
      p.category,
      p.sourceType,
      p.sourcedVolume,
      `Rs. ${Number(p.baseCost || 0).toLocaleString()}`,
      `Rs. ${p.avgPurchaseRate ? p.avgPurchaseRate.toFixed(1) : '0'}`,
      `Rs. ${Number(p.paidAmount || 0).toLocaleString()}`,
      `Rs. ${Number(p.pendingAmount || 0).toLocaleString()}`,
      `Rs. ${Number(p.resaleRevenue || 0).toLocaleString()}`,
    ]);

    exportTableToCSV({
      filename: `Supplier_Procurement_Report_${new Date().toISOString().split('T')[0]}`,
      title: 'Supplier Milk Procurement Report',
      metadata: [
        ['Period Filter', customDate ? `Date: ${customDate}` : periodFilter],
        ['Total Procured Volume', `${summaryData.totalVolume} L`],
        ['Total Procurement Cost', `Rs. ${summaryData.cost}`],
        ['Total Paid to Suppliers', `Rs. ${summaryData.paidSpend}`],
        ['Supplier Balance Due', `Rs. ${summaryData.pendingSpend}`],
        ['Average Purchase Rate', `Rs. ${summaryData.avgPurchaseRate.toFixed(1)}/L`],
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
            {['All Time', 'Today', 'This Month'].map((period) => {
              const isActive = periodFilter === period && !customDate;
              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => {
                    setPeriodFilter(period);
                    setCustomDate('');
                  }}
                  className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period}
                </button>
              );
            })}
          </div>

          {/* B. Specific Date Picker input */}
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) setPeriodFilter('');
              }}
              className="h-[36px] pl-8 pr-3 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-[#0092b8] focus:border-[#0092b8] transition cursor-pointer"
            />
          </div>

          {/* C. Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-[36px] px-4 rounded-full text-white text-xs font-bold bg-[#009966] hover:bg-[#008055] transition-all shadow-xs hover:shadow-sm active:translate-y-0 cursor-pointer"
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
