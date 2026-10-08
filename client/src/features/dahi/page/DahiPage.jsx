import React, { useState, useMemo } from 'react';
import { Layers, FileText, Calculator, Plus, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DahiStatsCards from '../component/DahiStatsCards';
import DahiKitchenPipeline from '../component/DahiKitchenPipeline';
import DahiBatchTable from '../component/DahiBatchTable';
import DahiProfitCalculator from '../component/DahiProfitCalculator';
import AddDahiBatchModal from '../component/AddDahiBatchModal';
import DahiBatchDetail from '../component/DahiBatchDetail';
import DahiDailyReport from '../component/DahiDailyReport';
import { useDahiContext } from '@/context/DahiContext';

// ── Date helpers ──────────────────────────────────────────────────────────────
function getDateBoundaries(range) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === 'today') {
    return { from: todayStart, to: now };
  }
  if (range === 'week') {
    // Mon–Sun week
    const day = now.getDay(); // 0=Sun
    const diff = (day === 0 ? -6 : 1 - day);
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() + diff);
    return { from: weekStart, to: now };
  }
  if (range === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: monthStart, to: now };
  }
  return null; // 'all'
}

function batchInRange(batch, boundaries) {
  if (!boundaries) return true;
  const rawDate = batch.date || batch.createdAt;
  if (!rawDate) return true; // no date → include
  const d = new Date(rawDate);
  return d >= boundaries.from && d <= boundaries.to;
}

const DATE_FILTERS = [
  { id: 'today',  label: 'Today' },
  { id: 'week',   label: 'This Week' },
  { id: 'month',  label: 'This Month' },
  { id: 'custom', label: 'Custom' },
  { id: 'all',    label: 'All Time' },
];

export default function DahiPage() {
  const {
    batches = [],
    metrics = {},
    addBatch,
    moveToChiller,
    sendToPOS,
    markSoldOut,
    deleteBatch,
  } = useDahiContext();

  const [activeTab, setActiveTab] = useState('pipeline');
  const [dateRange, setDateRange] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // Filtered batches for the selected date range
  const filteredBatches = useMemo(() => {
    if (dateRange === 'custom') {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(customTo + 'T23:59:59') : null;
      return batches.filter((b) => {
        const rawDate = b.date || b.createdAt;
        if (!rawDate) return true;
        const d = new Date(rawDate);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    const bounds = getDateBoundaries(dateRange);
    return batches.filter((b) => batchInRange(b, bounds));
  }, [batches, dateRange, customFrom, customTo]);

  const activePipelineCount = filteredBatches.filter(
    (b) => b.stage === 'incubating' || b.stage === 'chilled' || b.stage === 'pos'
  ).length;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Build date-scoped metrics from filtered batches
  const filteredMetrics = useMemo(() => {
    let farmConverted = 0;
    let supplierConverted = 0;
    let totalOutput = 0;

    filteredBatches.forEach((b) => {
      farmConverted += Number(b.farmMilkUsed) || 0;
      supplierConverted += Number(b.supplierMilkUsed) || 0;
      totalOutput += Number(b.outputVal || b.outputQuantity) || 0;
    });

    const totalConverted = farmConverted + supplierConverted;
    const dahiTransferred = filteredBatches
      .filter((b) => b.stage === 'pos' || b.stage === 'sold_out')
      .reduce((sum, b) => sum + (Number(b.outputVal || b.outputQuantity) || 0), 0);

    return {
      ...metrics,
      convertedToDahi: String(Number(totalConverted.toFixed(1))),
      farmConverted: String(Math.round(farmConverted)),
      supplierConverted: String(Math.round(supplierConverted)),
      dahiProduced: String(Number(totalOutput.toFixed(1))),
      dahiTransferredToPOS: String(Number(dahiTransferred.toFixed(1))),
    };
  }, [filteredBatches, metrics]);

  // Render Full-Screen Add Batch View
  if (isModalOpen) {
    return (
      <AddDahiBatchModal
        onClose={() => setIsModalOpen(false)}
        onAddBatch={addBatch}
      />
    );
  }

  // Render Full-Screen Detail View
  if (selectedBatchId) {
    return (
      <DahiBatchDetail
        batchId={selectedBatchId}
        onBack={() => setSelectedBatchId(null)}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-10 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
              Dahi Production &amp; Kitchen
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Value-Added Dairy · {todayFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Active Kitchen
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-3" />
          <span>Record New Batch</span>
        </button>
      </div>

      {/* ── Date Filter Tabs ── */}
      <div className="flex flex-wrap items-center gap-1.5">
        {DATE_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setDateRange(id)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              dateRange === id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="text-[10.5px] text-slate-400 font-medium ml-1">
          {filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Custom date range pickers */}
      {dateRange === 'custom' && (
        <div className="flex flex-wrap items-center gap-2.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-bold text-slate-600">Date Range:</span>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-800 font-semibold cursor-pointer text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-800 font-semibold cursor-pointer text-xs"
            />
          </div>
          {(customFrom || customTo) && (
            <button
              type="button"
              onClick={() => { setCustomFrom(''); setCustomTo(''); }}
              className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* 1. Top KPI Summary Cards (date-scoped) */}
      <DahiStatsCards metrics={filteredMetrics} />

      {/* 2. Middle Navigation Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {/* Tab 1: Active Kitchen Pipeline */}
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
              activeTab === 'pipeline'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Active Kitchen Pipeline</span>
            <span
              className={`text-[10.5px] font-black px-1.5 py-0.2 rounded-full leading-none ${
                activeTab === 'pipeline'
                  ? 'bg-emerald-500 text-slate-900'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {activePipelineCount}
            </span>
          </button>

          {/* Tab 2: All Batch History */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>All Batch History ({filteredBatches.length})</span>
          </button>

          {/* Tab 3: End-to-End Daily Report */}
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
              activeTab === 'report'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Daily Report</span>
          </button>

          {/* Tab 4: Simple Profit Calculator */}
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            <span>Simple Profit Calculator</span>
          </button>
        </div>
      </div>

      {/* 3. Tab Body Views */}
      {activeTab === 'pipeline' && (
        <DahiKitchenPipeline
          batches={filteredBatches}
          metrics={filteredMetrics}
          onMoveToChiller={moveToChiller}
          onSendToPOS={sendToPOS}
          onMarkSoldOut={markSoldOut}
          onOpenAddModal={() => setIsModalOpen(true)}
        />
      )}

      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">
                All Dahi Production Batches
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Showing <span className="font-semibold text-slate-600">{filteredBatches.length}</span> batches for <span className="font-semibold text-emerald-600">{DATE_FILTERS.find(f => f.id === dateRange)?.label}</span>
              </p>
            </div>
          </div>
          <DahiBatchTable batches={filteredBatches} onDeleteBatch={deleteBatch} onViewDetail={setSelectedBatchId} />
        </div>
      )}

      {activeTab === 'report' && <DahiDailyReport />}

      {activeTab === 'calculator' && <DahiProfitCalculator />}
    </div>
  );
}
