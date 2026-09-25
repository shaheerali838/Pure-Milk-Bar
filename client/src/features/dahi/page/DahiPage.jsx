import React, { useState } from 'react';
import {
  Layers,
  FileText,
  Calculator,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DahiStatsCards from '../component/DahiStatsCards';
import DahiKitchenPipeline from '../component/DahiKitchenPipeline';
import DahiBatchTable from '../component/DahiBatchTable';
import DahiProfitCalculator from '../component/DahiProfitCalculator';
import AddDahiBatchModal from '../component/AddDahiBatchModal';
import DahiBatchDetail from '../component/DahiBatchDetail';
import DahiDailyReport from '../component/DahiDailyReport';
import { useDahiContext } from '@/context/DahiContext';

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

  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'history' | 'calculator'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  const activePipelineCount = batches.filter(
    (b) => b.stage === 'incubating' || b.stage === 'chilled' || b.stage === 'pos'
  ).length;

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
    <div className="space-y-2.5">
      {/* Top Header Row with Title and + Record New Batch button */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight font-display">
            Dahi Production & Kitchen Pipeline
          </h2>
          <p className="text-[11px] text-slate-500">
            Transform fresh farm &amp; supplier liquid milk into high-margin curd batches
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="flex items-center gap-1.5 text-xs font-bold shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Record New Batch
        </Button>
      </div>

      {/* 1. Top KPI Summary Cards */}
      <DahiStatsCards metrics={metrics} />

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
            <span>All Batch History ({batches.length})</span>
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
          batches={batches}
          metrics={metrics}
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
              <p className="text-[11px] text-slate-400">
                Complete historical record of all setting, chilled, and dispatched batches
              </p>
            </div>
          </div>
          <DahiBatchTable batches={batches} onDeleteBatch={deleteBatch} onViewDetail={setSelectedBatchId} />
        </div>
      )}

      {activeTab === 'report' && <DahiDailyReport />}

      {activeTab === 'calculator' && <DahiProfitCalculator />}
    </div>
  );
}
