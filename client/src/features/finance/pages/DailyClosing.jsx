import React, { useState, useEffect } from 'react';
import DailyClosingHeader from '../components/DailyClosing/DailyClosingHeader';
import DailyClosingVarianceAlert from '../components/DailyClosing/DailyClosingVarianceAlert';
import MilkFlowReconciliationCard from '../components/DailyClosing/MilkFlowReconciliationCard';
import PhysicalStockCheckCard from '../components/DailyClosing/PhysicalStockCheckCard';
import CollectionsAndProfitCard from '../components/DailyClosing/CollectionsAndProfitCard';
import NetLiquidFlowSummary from '../components/DailyClosing/NetLiquidFlowSummary';
import TodayProfitBreakdown from '../components/DailyClosing/TodayProfitBreakdown';
import ConfirmClosingDialog from '../components/DailyClosing/ConfirmClosingDialog';
import {
  getDailyClosingSummary,
  confirmDailyClosing,
  exportDailyClosingCsv,
} from '../services/dailyClosingService';

export default function DailyClosing() {
  const todayStr = new Date().toISOString().split('T')[0];
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [period, setPeriod] = useState('today'); // 'today' | 'weekly' | 'monthly' | 'custom'
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [startDate, setStartDate] = useState(sevenDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  // User input for physical milk stock measurement
  const [physicalStock, setPhysicalStock] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch summary on date or range change
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getDailyClosingSummary({
          date: selectedDate,
          period,
          startDate: period === 'custom' ? startDate : null,
          endDate: period === 'custom' ? endDate : null,
        });
        if (isMounted) {
          setSummaryData(data);
          if (data?.physicalStock?.physicalClosingStock !== null && data?.physicalStock?.physicalClosingStock !== undefined) {
            setPhysicalStock(String(data.physicalStock.physicalClosingStock));
          }
        }
      } catch (err) {
        console.error('Failed to load daily closing summary:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, period, startDate, endDate]);

  // Derived calculations
  const expectedStock = summaryData?.milkFlow?.expectedClosingStock ?? null;
  const isPhysicalInput = physicalStock !== '' && !isNaN(Number(physicalStock));
  const variance = isPhysicalInput && expectedStock !== null
    ? Number(physicalStock) - Number(expectedStock)
    : null;

  // Handlers
  const handleExportCsv = () => {
    if (!summaryData) return;
    const exportPayload = {
      ...summaryData,
      period,
      startDate: period === 'custom' ? startDate : null,
      endDate: period === 'custom' ? endDate : null,
      physicalStock: {
        physicalClosingStock: isPhysicalInput ? Number(physicalStock) : null,
        variance,
      },
    };
    exportDailyClosingCsv(exportPayload);
  };

  const handleConfirmClosing = async () => {
    if (!summaryData) return;
    setIsSubmitting(true);
    try {
      const closingPayload = {
        date: selectedDate,
        period,
        startDate: period === 'custom' ? startDate : null,
        endDate: period === 'custom' ? endDate : null,
        physicalStock: isPhysicalInput ? Number(physicalStock) : null,
        expectedStock,
        variance,
        summarySnapshot: summaryData,
      };
      const res = await confirmDailyClosing(closingPayload);
      if (res.success) {
        setSummaryData((prev) => ({
          ...prev,
          status: 'closed',
          lastClosedAt: res.closedAt,
        }));
        setConfirmDialogOpen(false);
      }
    } catch (err) {
      console.error('Failed to confirm daily closing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 pb-4">
      <DailyClosingHeader
        period={period}
        onPeriodChange={setPeriod}
        status={summaryData?.status || 'open'}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onExportCsv={handleExportCsv}
        onOpenConfirmDialog={() => setConfirmDialogOpen(true)}
      />

      <DailyClosingVarianceAlert
        variance={variance}
        hasPhysicalCount={isPhysicalInput}
        status={summaryData?.status || 'open'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          <MilkFlowReconciliationCard
            milkFlow={summaryData?.milkFlow || {}}
          />
          <PhysicalStockCheckCard
            physicalStock={physicalStock}
            onPhysicalStockChange={setPhysicalStock}
            expectedStock={expectedStock}
            variance={variance}
          />
        </div>

        <div className="space-y-5">
          <CollectionsAndProfitCard
            collections={summaryData?.collections || {}}
            expenses={summaryData?.expenses || {}}
          />
        </div>
      </div>

      <NetLiquidFlowSummary
        financialSummary={summaryData?.financialSummary || {}}
        collections={summaryData?.collections || {}}
        expenses={summaryData?.expenses || {}}
      />

      <TodayProfitBreakdown
        productBreakdown={summaryData?.productBreakdown || []}
        financialSummary={summaryData?.financialSummary || {}}
      />

      <ConfirmClosingDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmClosing}
        isSubmitting={isSubmitting}
        summaryData={summaryData || {}}
        physicalStock={physicalStock}
        variance={variance}
      />
    </div>
  );
}
