import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  getPktTodayString,
  getPktDaysAgoString,
  normalizeDateStr,
} from '@/utils/dateUtils';

import DailyClosingHeader from '../components/DailyClosing/DailyClosingHeader';
import DailyClosingKpis from '../components/DailyClosing/DailyClosingKpis';
import ProductStockFlowTable from '../components/DailyClosing/ProductStockFlowTable';
import DailyDahiStatusCard from '../components/DailyClosing/DailyDahiStatusCard';
import MilkHisaabAccordion from '../components/DailyClosing/MilkHisaabAccordion';
import PhysicalMilkCheckCard from '../components/DailyClosing/PhysicalMilkCheckCard';
import MoneyInAndOutBlock from '../components/DailyClosing/MoneyInAndOutBlock';
import ProductProfitTable from '../components/DailyClosing/ProductProfitTable';
import DailyClosingModuleDetails from '../components/DailyClosing/DailyClosingModuleDetails';
import PreviousClosingsHistory from '../components/DailyClosing/PreviousClosingsHistory';
import AddWastageDialog from '../components/DailyClosing/AddWastageDialog';
import ConfirmClosingDialog from '../components/DailyClosing/ConfirmClosingDialog';
import DailyClosingPLBreakdown from '../components/DailyClosing/DailyClosingPLBreakdown';

import {
  getDailyClosingSummary,
  confirmDailyClosing,
  exportDailyClosingCsv,
  reopenDailyClosing,
} from '../services/dailyClosingService';
import { useDailyClose } from '@/context/DailyCloseContext';
import { useGlobalDate } from '@/context/GlobalDateContext';
import { usePOSContext } from '@/context/POSContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useExpense } from '@/context/ExpenseContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';

export default function DailyClosing() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { globalDate } = useGlobalDate();
  const {
    isDayClosed: isGlobalDayClosed,
    closeDay,
    openNewDay,
    reopenDay,
    closingStock: liveClosingStock,
    dailyCloseHistory = [],
  } = useDailyClose();

  const { salesHistory = [], supplierSalesHistory = [] } = usePOSContext() || {};
  const { intakeLogs = [] } = useIntakeContext() || {};
  const { expenses: farmExpenses = [] } = useExpense() || {};
  const { expenses: supplierExpenses = [] } = useSourcExpenseContext() || {};

  const todayStr = getPktTodayString();
  const sevenDaysAgoStr = getPktDaysAgoString(7);

  const [period, setPeriod] = useState('today'); // 'today' | 'weekly' | 'monthly' | 'custom'
  const [selectedDate, setSelectedDate] = useState(() => globalDate || todayStr);
  const [startDate, setStartDate] = useState(sevenDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Synchronize selectedDate when globalDate changes
  useEffect(() => {
    if (globalDate) {
      setSelectedDate(globalDate);
    }
  }, [globalDate]);

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // User input states for physical verification
  const [physicalMilk, setPhysicalMilk] = useState('');
  const [varianceReason, setVarianceReason] = useState('');
  const [productPhysicalCounts, setProductPhysicalCounts] = useState({});
  const [supervisorNotes, setSupervisorNotes] = useState('');

  // Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [addWastageOpen, setAddWastageOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Load summary data
  const loadSummary = useCallback(
    async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setLoading(true);
      else setIsRefreshing(true);
      setFetchError(null);

      try {
        const data = await getDailyClosingSummary({
          date: selectedDate,
          period,
          startDate: period === 'custom' ? startDate : null,
          endDate: period === 'custom' ? endDate : null,
        });

        setSummaryData(data);

        // Populate physical count if existing closing snapshot was loaded
        if (data?.closing?.physicalMilk !== undefined && data?.closing?.physicalMilk !== null) {
          setPhysicalMilk(String(data.closing.physicalMilk));
        } else if (data?.physicalStock?.physicalClosingStock !== null && data?.physicalStock?.physicalClosingStock !== undefined) {
          setPhysicalMilk(String(data.physicalStock.physicalClosingStock));
        }

        if (data?.closing?.varianceReason) {
          setVarianceReason(data.closing.varianceReason);
        }
      } catch (err) {
        console.error('Failed to load daily closing summary:', err);
        setFetchError(err.message || 'Unable to connect to database. Please check connection and retry.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedDate, period, startDate, endDate]
  );

  // Initial fetch and on filter changes
  useEffect(() => {
    loadSummary(true);
  }, [loadSummary]);

  // Window Focus, 30s background polling & Instant Event Sync on POS sales and actions
  useEffect(() => {
    const handleSync = () => {
      if (summaryData?.status === 'OPEN' || !summaryData?.status) {
        loadSummary(false);
      }
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('pure_milk_bar_pos_sale_completed', handleSync);
    window.addEventListener('pure_milk_bar_sales_updated', handleSync);
    window.addEventListener('pure_milk_bar_dahi_updated', handleSync);
    window.addEventListener('pure_milk_bar_inventory_updated', handleSync);
    window.addEventListener('pure_milk_bar_daily_closing_updated', handleSync);
    window.addEventListener('storage', handleSync);

    const interval = setInterval(() => {
      if (summaryData?.status === 'OPEN' || !summaryData?.status) {
        loadSummary(false);
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('pure_milk_bar_pos_sale_completed', handleSync);
      window.removeEventListener('pure_milk_bar_sales_updated', handleSync);
      window.removeEventListener('pure_milk_bar_dahi_updated', handleSync);
      window.removeEventListener('pure_milk_bar_inventory_updated', handleSync);
      window.removeEventListener('pure_milk_bar_daily_closing_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, [summaryData?.status, loadSummary]);

  // Handle Product physical count input change
  const handleProductPhysicalCountChange = (productId, val) => {
    setProductPhysicalCounts((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!summaryData) return;
    exportDailyClosingCsv({
      ...summaryData,
      period,
      startDate: period === 'custom' ? startDate : null,
      endDate: period === 'custom' ? endDate : null,
      closing: {
        ...(summaryData.closing || {}),
        physicalMilk: physicalMilk !== '' ? Number(physicalMilk) : summaryData.closing?.physicalMilk,
      },
    });
    toast.success('Day end summary CSV downloaded successfully.');
  };

  // Start Next Day Closing (Clear active input and advance date so opening stock & cash carry forward)
  const handleStartNextDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + 1);
    const nextDateStr = cur.toISOString().split('T')[0];

    setSelectedDate(nextDateStr);
    setPeriod('today');
    setPhysicalMilk('');
    setVarianceReason('');
    setProductPhysicalCounts({});
    setSupervisorNotes('');

    // Advance Day & Carry forward remaining closing stock to next day opening stock
    openNewDay(nextDateStr);

    toast.success(`Advanced to new business day: ${nextDateStr}. Opening stocks automatically carried forward!`);
  };

  // Dynamic Farm P&L, Supplier P&L, and Total Business Final P&L calculation for selectedDate
  const computedPL = React.useMemo(() => {
    // 1. If an existing finalized closing snapshot exists with farm/supplier data, use it
    if (summaryData?.closing?.farm && summaryData?.closing?.supplier) {
      return {
        farm: summaryData.closing.farm,
        supplier: summaryData.closing.supplier,
        totalBusinessProfit: summaryData.closing.totalBusinessProfit ?? (Number(summaryData.closing.farm.netProfit || 0) + Number(summaryData.closing.supplier.netProfit || 0)),
      };
    }

    // Check saved dailyCloseHistory for this date
    const historicalClose = (dailyCloseHistory || []).find((h) => h.date === selectedDate);
    if (historicalClose?.farm && historicalClose?.supplier) {
      return {
        farm: historicalClose.farm,
        supplier: historicalClose.supplier,
        totalBusinessProfit: historicalClose.totalBusinessProfit ?? (Number(historicalClose.farm.netProfit || 0) + Number(historicalClose.supplier.netProfit || 0)),
      };
    }

    // 2. Dynamic Calculation from live transactions for selectedDate
    const targetDate = selectedDate;

    // A. Sales Revenue Breakdown (Farm vs Supplier)
    const activeSales = (salesHistory && salesHistory.length > 0) ? salesHistory : (summaryData?.breakdown?.orders?.logs || []);
    let farmMilkRevenue = 0;
    let farmDahiRevenue = 0;
    let supplierMilkRevenue = 0;
    let supplierDahiRevenue = 0;

    activeSales.forEach((sale) => {
      const sDate = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt || sale.formattedDate);
      if (sDate !== targetDate) return;

      const items = Array.isArray(sale.items) ? sale.items : [];
      if (items.length === 0) {
        const rev = Number(sale.grandTotal || sale.netPayable || sale.subtotal) || 0;
        farmMilkRevenue += rev;
        return;
      }

      items.forEach((item) => {
        const src = (item.source || '').toLowerCase();
        const itemName = (item.name || '').toLowerCase();
        const itemCat = (item.category || '').toLowerCase();
        const isDahi = itemName.includes('dahi') || itemCat.includes('dahi') || itemName.includes('yogurt') || itemCat.includes('yogurt');

        const itemTotal = Number(item.subtotal || item.effectiveRevenue) || ((Number(item.quantity) || 0) * (Number(item.price || item.unitPrice) || 0));

        if (item.supplierRevenue !== undefined && item.farmRevenue !== undefined) {
          const sRev = Number(item.supplierRevenue) || 0;
          const fRev = Number(item.farmRevenue) || 0;
          if (isDahi) {
            farmDahiRevenue += fRev;
            supplierDahiRevenue += sRev;
          } else {
            farmMilkRevenue += fRev;
            supplierMilkRevenue += sRev;
          }
        } else {
          const isSupplier = src.includes('supplier');
          const isMixed = src.includes('mixed');
          const farmRatio = isMixed ? (Number(item.farmRatio) || 0.5) : (isSupplier ? 0 : 1);
          const supplierRatio = isMixed ? (Number(item.supplierRatio) || 0.5) : (isSupplier ? 1 : 0);

          if (isDahi) {
            farmDahiRevenue += itemTotal * farmRatio;
            supplierDahiRevenue += itemTotal * supplierRatio;
          } else {
            farmMilkRevenue += itemTotal * farmRatio;
            supplierMilkRevenue += itemTotal * supplierRatio;
          }
        }
      });
    });

    // Fallback: If supplier revenue was isolated in supplierSalesHistory
    if (supplierMilkRevenue === 0 && supplierDahiRevenue === 0 && supplierSalesHistory.length > 0) {
      supplierSalesHistory.forEach((sale) => {
        const sDate = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt || sale.formattedDate);
        if (sDate !== targetDate) return;
        (sale.items || []).forEach((item) => {
          const itemName = (item.name || '').toLowerCase();
          const itemCat = (item.category || '').toLowerCase();
          const isDahi = itemName.includes('dahi') || itemCat.includes('dahi');
          const rev = Number(item.effectiveRevenue || item.subtotal || item.supplierRevenue) || 0;
          if (isDahi) {
            supplierDahiRevenue += rev;
          } else {
            supplierMilkRevenue += rev;
          }
        });
      });
    }

    const farmTotalRevenue = Math.round(farmMilkRevenue + farmDahiRevenue);
    const supplierTotalRevenue = Math.round(supplierMilkRevenue + supplierDahiRevenue);

    // B. Supplier Milk Purchased & Procurement Cost
    // Calculate total procurement cost dynamically from today's supplier purchase records:
    // totalProcurementCost = todaySupplierPurchases.reduce((total, item) => total + Number(item.qty || 0) * Number(item.price || 0), 0)
    const activeIntakes = (intakeLogs && intakeLogs.length > 0) ? intakeLogs : (summaryData?.breakdown?.procurement?.logs || []);
    let supplierPurchasedQty = 0;
    let totalProcurementCost = 0;

    activeIntakes.forEach((item) => {
      const iDate = normalizeDateStr(item.date || item.createdAt);
      if (iDate !== targetDate) return;

      const qty = Number(item.quantity || item.quantityLiters || item.qty || 0);
      const rate = Number(item.rate || item.ratePerLiter || item.price || item.unitPrice || 0);
      const itemCost = (item.totalCost !== undefined && item.totalCost !== null)
        ? Number(item.totalCost)
        : (item.totalAmount !== undefined && item.totalAmount !== null)
        ? Number(item.totalAmount)
        : (qty * rate);

      supplierPurchasedQty += qty;
      totalProcurementCost += itemCost;
    });

    if (totalProcurementCost === 0 && summaryData?.breakdown?.procurement?.totalBill) {
      totalProcurementCost = Number(summaryData.breakdown.procurement.totalBill);
      supplierPurchasedQty = Number(summaryData.breakdown.procurement.totalLiters || 0);
    }

    const supplierAvgRate = supplierPurchasedQty > 0
      ? (totalProcurementCost / supplierPurchasedQty).toFixed(1)
      : 0;

    // C. Farm and Supplier Expenses
    const activeFarmExpenses = (farmExpenses && farmExpenses.length > 0) ? farmExpenses : [];
    let farmTotalExpenses = 0;
    activeFarmExpenses.forEach((exp) => {
      const eDate = normalizeDateStr(exp.date || exp.createdAt);
      if (eDate === targetDate) {
        farmTotalExpenses += (Number(exp.amount) || 0);
      }
    });

    const activeSupplierExpenses = (supplierExpenses && supplierExpenses.length > 0) ? supplierExpenses : [];
    let supplierTotalExpenses = 0;
    activeSupplierExpenses.forEach((exp) => {
      const eDate = normalizeDateStr(exp.date || exp.createdAt);
      if (eDate === targetDate) {
        supplierTotalExpenses += (Number(exp.amount) || 0);
      }
    });

    // Fallback to summaryData expenses if farmTotalExpenses is 0
    if (farmTotalExpenses === 0 && summaryData?.expenses?.total) {
      farmTotalExpenses = Number(summaryData.expenses.total);
    }

    // D. Net Profit Calculations
    // Farm Net Profit: Do not subtract milk procurement cost from Farm P&L
    const farmNetProfit = farmTotalRevenue - farmTotalExpenses;

    // Supplier Net Profit: supplierTotalRevenue - totalProcurementCost - supplierTotalExpenses
    const supplierNetProfit = supplierTotalRevenue - totalProcurementCost - supplierTotalExpenses;

    // Total Business Profit = farmNetProfit + supplierNetProfit
    const totalBusinessProfit = farmNetProfit + supplierNetProfit;

    return {
      farm: {
        milkRevenue: farmMilkRevenue,
        dahiRevenue: farmDahiRevenue,
        totalRevenue: farmTotalRevenue,
        totalExpenses: farmTotalExpenses,
        netProfit: farmNetProfit,
      },
      supplier: {
        purchasedQty: supplierPurchasedQty,
        avgRate: supplierAvgRate,
        totalProcurementCost,
        milkRevenue: supplierMilkRevenue,
        dahiRevenue: supplierDahiRevenue,
        totalRevenue: supplierTotalRevenue,
        totalExpenses: supplierTotalExpenses,
        netProfit: supplierNetProfit,
      },
      totalBusinessProfit,
    };
  }, [summaryData, dailyCloseHistory, selectedDate, salesHistory, supplierSalesHistory, intakeLogs, farmExpenses, supplierExpenses]);

  // Confirm and save closing
  const handleConfirmDailyClosing = async () => {
    if (!summaryData) return;

    const countsArray = Object.entries(productPhysicalCounts)
      .filter(([, count]) => count !== '' && !isNaN(Number(count)))
      .map(([productId, count]) => ({
        productId,
        count: Number(count),
      }));

    setIsConfirming(true);
    try {
      const closingRecord = {
        date: selectedDate,
        farm: {
          totalRevenue: computedPL.farm.totalRevenue,
          totalExpenses: computedPL.farm.totalExpenses,
          netProfit: computedPL.farm.netProfit,
        },
        supplier: {
          totalRevenue: computedPL.supplier.totalRevenue,
          totalProcurementCost: computedPL.supplier.totalProcurementCost,
          totalExpenses: computedPL.supplier.totalExpenses,
          netProfit: computedPL.supplier.netProfit,
        },
        totalBusinessProfit: computedPL.totalBusinessProfit,
        totalRevenue: (computedPL.farm.totalRevenue + computedPL.supplier.totalRevenue),
        totalExpenses: (computedPL.farm.totalExpenses + computedPL.supplier.totalExpenses),
        netProfit: computedPL.totalBusinessProfit,
        closingStock: liveClosingStock,
        closedAt: new Date().toISOString(),
      };

      const res = await confirmDailyClosing({
        date: selectedDate,
        physicalMilkLiters: physicalMilk !== '' ? Number(physicalMilk) : 0,
        varianceReason,
        notes: supervisorNotes,
        productPhysicalCounts: countsArray,
        report: closingRecord,
      });

      // Synchronize with global DailyCloseContext after save operation succeeds
      closeDay(closingRecord);

      toast.success(res?.message || 'Daily closing successfully confirmed and locked!');
      setConfirmDialogOpen(false);
      setHistoryRefreshTrigger((prev) => prev + 1);
      // Reload fresh frozen data
      loadSummary(true);
    } catch (err) {
      toast.error(err.message || 'Failed to confirm daily closing.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Reopen Day
  const handleReopenDay = async () => {
    const closingId = summaryData?.closing?.id || summaryData?.closing?._id || summaryData?._id;
    const reason = window.prompt('Please provide a reason for reopening this closed day:', 'Supervisor revision to reactivate operations') || 'Reopened to reactivate website operations';

    try {
      if (closingId) {
        try {
          await reopenDailyClosing(closingId, reason);
        } catch (_) {}
      }
      await reopenDay(reason);
      toast.success('Day end closing reopened! Website operations are now ACTIVE.');
      setHistoryRefreshTrigger((prev) => prev + 1);
      loadSummary(true);
    } catch (err) {
      toast.error(err.message || 'Failed to reopen closing.');
    }
  };

  const isClosed = ['CLOSED', 'APPROVED', 'LOCKED', 'RECONCILED'].includes(summaryData?.status) || isGlobalDayClosed;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER STATES (Loading Skeleton & Error State)
  // ═══════════════════════════════════════════════════════════════════════════

  if (loading && !summaryData) {
    return (
      <div className="space-y-4 pb-8 max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-36 animate-pulse" />
        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-28 animate-pulse" />
          ))}
        </div>
        {/* Hero Table Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-64 animate-pulse" />
      </div>
    );
  }

  if (fetchError && !summaryData) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unable to Load Daily Closing</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{fetchError}</p>
        </div>
        <Button onClick={() => loadSummary(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-2 transition-all">
      {/* 1. Compact Header (Status, Date Picker, Period Dropdown, CSV & Confirm Buttons) */}
      <DailyClosingHeader
        period={period}
        onPeriodChange={setPeriod}
        status={summaryData?.status || 'OPEN'}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onExportCsv={handleExportCsv}
        onOpenConfirmDialog={() => setConfirmDialogOpen(true)}
        onOpenReopenDialog={handleReopenDay}
        onStartNextDay={handleStartNextDay}
        closingInfo={summaryData?.closing}
        isAdmin={isAdmin}
        isRefreshing={isRefreshing}
      />

      {/* Warnings / Notices if any */}
      {Array.isArray(summaryData?.warnings) && summaryData.warnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
          {summaryData.warnings.map((w, idx) => (
            <div key={idx} className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* 2. 4 KPI Cards (Milk Sold, Total Sales, Money Collected, Estimated Profit) */}
      <DailyClosingKpis
        milkSold={(summaryData?.milk?.counterSales ?? 0) + (summaryData?.milk?.doorstepSales ?? 0)}
        counterSales={summaryData?.milk?.counterSales ?? 0}
        doorstepSales={summaryData?.milk?.doorstepSales ?? 0}
        totalSales={summaryData?.profit?.grossRevenue ?? (computedPL.farm.totalRevenue + computedPL.supplier.totalRevenue)}
        moneyCollected={summaryData?.collections?.totalCollected ?? 0}
        estimatedProfit={computedPL.totalBusinessProfit ?? (summaryData?.profit?.estimatedProfit ?? 0)}
        isClosed={isClosed}
      />

      {/* 2.5 Farm P&L, Supplier P&L, and Total Business Final P&L Segregated Analysis */}
      <DailyClosingPLBreakdown
        farmPL={computedPL.farm}
        supplierPL={computedPL.supplier}
        totalBusinessProfit={computedPL.totalBusinessProfit}
        date={selectedDate}
        isClosed={isClosed}
      />

      {/* 3. Hero Table: Stock Flow */}
      <ProductStockFlowTable
        products={summaryData?.products || []}
        supplierMilkFlow={summaryData?.supplierMilkFlow || {
          totalPurchased: summaryData?.milk?.supplierInflow ?? computedPL?.supplier?.purchasedQty ?? 0,
          cowPurchased: summaryData?.milk?.cowSupplierInflow ?? 0,
          buffPurchased: summaryData?.milk?.buffSupplierInflow ?? (summaryData?.milk?.supplierInflow ?? 0),
          totalSold: summaryData?.milk?.totalSupplierMilkSold ?? 0,
          remainingStock: Math.max(0, (summaryData?.milk?.supplierInflow ?? 0) - (summaryData?.milk?.totalSupplierMilkSold ?? 0)),
          totalBill: summaryData?.breakdown?.procurement?.totalBill ?? computedPL?.supplier?.totalProcurementCost ?? 0,
          cashPaid: summaryData?.breakdown?.procurement?.totalPaid ?? 0,
          totalDue: summaryData?.breakdown?.procurement?.totalDue ?? 0,
        }}
        openingSource={summaryData?.openingSource || {}}
        physicalCounts={productPhysicalCounts}
        onPhysicalCountChange={handleProductPhysicalCountChange}
        isClosed={isClosed}
      />

      {/* 4. Dahi & Dairy Processing All-Day Status Card & Live Batches */}
      <DailyDahiStatusCard
        selectedDate={selectedDate}
        breakdown={summaryData?.breakdown}
        isClosed={isClosed}
      />

      {/* 5. Physical Milk Dipstick Check Card */}
      <PhysicalMilkCheckCard
        physicalMilk={physicalMilk}
        onPhysicalMilkChange={setPhysicalMilk}
        expectedMilk={summaryData?.milk?.expectedClosing ?? 0}
        varianceReason={varianceReason}
        onVarianceReasonChange={setVarianceReason}
        isClosed={isClosed}
        savedClosing={summaryData?.closing}
      />

      {/* 5. Milk Hisaab (Mass Balance Breakdown - Collapsed by default) */}
      <MilkHisaabAccordion
        milk={summaryData?.milk || {}}
        onOpenAddWastage={() => setAddWastageOpen(true)}
        isClosed={isClosed}
      />

      {/* 6. Money In & Out Block (Collections, Expenses, Drawer Cash, Profit) */}
      <MoneyInAndOutBlock
        collections={summaryData?.collections || {}}
        creditGiven={summaryData?.creditGiven || 0}
        expenses={summaryData?.expenses || {}}
        cash={summaryData?.cash || {}}
        profit={summaryData?.profit || {}}
        selectedDate={selectedDate}
      />

      {/* 7. Product-wise Sales & Profit Table (Collapsed by default) */}
      <ProductProfitTable products={summaryData?.products || []} />

      {/* 8. Complete Software Module Breakdown (All Operations & Audit Logs) */}
      {summaryData?.breakdown && (
        <DailyClosingModuleDetails
          breakdown={summaryData.breakdown}
          isClosed={isClosed}
        />
      )}

      {/* 9. Previous Closings History List (Complete Audit Log) */}
      <PreviousClosingsHistory
        onSelectDate={(d) => {
          setSelectedDate(d);
          setPeriod('today');
        }}
        refreshTrigger={historyRefreshTrigger}
      />

      {/* Modals */}
      <AddWastageDialog
        open={addWastageOpen}
        onOpenChange={setAddWastageOpen}
        onWastageAdded={() => {
          toast.success('Wastage logged successfully.');
          loadSummary(true);
        }}
        products={summaryData?.products || []}
        date={selectedDate}
      />

      <ConfirmClosingDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmDailyClosing}
        isSubmitting={isConfirming}
        summaryData={summaryData || {}}
        computedPL={computedPL}
        physicalMilk={physicalMilk}
        varianceReason={varianceReason}
        notes={supervisorNotes}
        onNotesChange={setSupervisorNotes}
      />
    </div>
  );
}
