import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  getPktTodayString,
  getPktDaysAgoString,
} from '@/utils/dateUtils';

import DailyClosingHeader from '../components/DailyClosing/DailyClosingHeader';
import DailyClosingKpis from '../components/DailyClosing/DailyClosingKpis';
import ProductStockFlowTable from '../components/DailyClosing/ProductStockFlowTable';
import MilkHisaabAccordion from '../components/DailyClosing/MilkHisaabAccordion';
import PhysicalMilkCheckCard from '../components/DailyClosing/PhysicalMilkCheckCard';
import MoneyInAndOutBlock from '../components/DailyClosing/MoneyInAndOutBlock';
import ProductProfitTable from '../components/DailyClosing/ProductProfitTable';
import PreviousClosingsHistory from '../components/DailyClosing/PreviousClosingsHistory';
import AddWastageDialog from '../components/DailyClosing/AddWastageDialog';
import ConfirmClosingDialog from '../components/DailyClosing/ConfirmClosingDialog';

import {
  getDailyClosingSummary,
  confirmDailyClosing,
  exportDailyClosingCsv,
  reopenDailyClosing,
} from '../services/dailyClosingService';

export default function DailyClosing() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const todayStr = getPktTodayString();
  const sevenDaysAgoStr = getPktDaysAgoString(7);

  const [period, setPeriod] = useState('today'); // 'today' | 'weekly' | 'monthly' | 'custom'
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [startDate, setStartDate] = useState(sevenDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

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

  // Window Focus & 60s background polling (when status is Open)
  useEffect(() => {
    const handleFocus = () => {
      if (summaryData?.status === 'OPEN' || !summaryData?.status) {
        loadSummary(false);
      }
    };

    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      if (summaryData?.status === 'OPEN' || !summaryData?.status) {
        loadSummary(false);
      }
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
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
      const res = await confirmDailyClosing({
        date: selectedDate,
        physicalMilkLiters: physicalMilk !== '' ? Number(physicalMilk) : 0,
        varianceReason,
        notes: supervisorNotes,
        productPhysicalCounts: countsArray,
      });

      toast.success(res?.message || 'Daily closing successfully confirmed and locked!');
      setConfirmDialogOpen(false);
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
    if (!summaryData?.closing?.id) return;
    const reason = window.prompt('Please provide a reason for reopening this closed day:', 'Supervisor revision');
    if (!reason) return;

    try {
      await reopenDailyClosing(summaryData.closing.id, reason);
      toast.success('Day end closing reopened successfully. Calculations are now live.');
      loadSummary(true);
    } catch (err) {
      toast.error(err.message || 'Failed to reopen closing.');
    }
  };

  const isClosed = ['CLOSED', 'APPROVED', 'LOCKED', 'RECONCILED'].includes(summaryData?.status);

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
    <div className="space-y-4 sm:space-y-5 pb-8 max-w-7xl mx-auto px-2 sm:px-4 transition-all">
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

      {/* 2. 4 KPI Cards (Milk in tanks, Total Sales, Money Collected, Estimated Profit) */}
      <DailyClosingKpis
        milkExpected={summaryData?.milk?.expectedClosing ?? 0}
        isMilkNegative={summaryData?.milk?.isNegative ?? false}
        totalSales={summaryData?.profit?.grossRevenue ?? 0}
        moneyCollected={summaryData?.collections?.totalCollected ?? 0}
        estimatedProfit={summaryData?.profit?.estimatedProfit ?? 0}
        isClosed={isClosed}
      />

      {/* 3. Hero Table: "Kal se kya bacha → Aj kya bika → Abhi kitna bacha" */}
      <ProductStockFlowTable
        products={summaryData?.products || []}
        openingSource={summaryData?.openingSource || {}}
        physicalCounts={productPhysicalCounts}
        onPhysicalCountChange={handleProductPhysicalCountChange}
        isClosed={isClosed}
      />

      {/* 4. Physical Milk Dipstick Check Card */}
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
      />

      {/* 7. Product-wise Sales & Profit Table (Collapsed by default) */}
      <ProductProfitTable products={summaryData?.products || []} />

      {/* 8. Previous Closings History List (Collapsed audit log) */}
      <PreviousClosingsHistory onSelectDate={(d) => setSelectedDate(d)} />

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
        physicalMilk={physicalMilk}
        varianceReason={varianceReason}
        notes={supervisorNotes}
        onNotesChange={setSupervisorNotes}
      />
    </div>
  );
}
