import React from 'react';
import {
  ArrowLeft,
  Trash2,
  Layers,
  Milk,
  CheckCircle,
  Clock,
  Settings,
  Droplets,
  DollarSign
} from 'lucide-react';
import { useDahiContext } from '@/context/DahiContext';

export default function DahiBatchDetail({ batchId, onBack }) {
  const { batches = [], deleteBatch } = useDahiContext();

  const batch = batches.find((b) => String(b.id) === String(batchId));

  if (!batch) {
    return (
      <div className="p-8 bg-slate-50 min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 font-display">
          Batch Record Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested dahi batch does not exist or has been removed.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition shadow-2xs"
        >
          Back to Dahi Pipeline
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete batch ${batch.id}?`)) {
      deleteBatch(batch.id);
      onBack();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top action & header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dahi Pipeline
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Batch Profile — {batch.id}
            </h1>
            <p className="text-xs text-slate-500">
              ID #{batch.id} • Processed on {batch.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/70 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Batch
          </button>
        </div>
      </div>

      {/* Main details card container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Profile Hero Section */}
        <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-2xl shadow-xs shrink-0 font-display">
              <Layers className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  {batch.product}
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {batch.id}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(batch.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${batch.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  {batch.status}
                </span>
                <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">
                  {batch.source || 'Farm Milk'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Final Output Yield
              </span>
              <span className="text-2xl font-black text-[#009689] font-mono">
                {batch.output}
              </span>
            </div>
          </div>
        </div>

        {/* Highlight Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
            <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Milk className="w-3.5 h-3.5" />
              Total Milk Input
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              {batch.milkUsed}
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70">
            <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Droplets className="w-3.5 h-3.5" />
              Fat Content
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              {batch.fat || '4.5%'}
            </p>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/70">
            <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              Processing Date
            </div>
            <p className="text-sm font-bold text-slate-800 font-mono">
              {batch.date}
            </p>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70">
            <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Retail POS Rate
            </div>
            <p className="text-sm font-bold text-slate-800 font-mono">
              {batch.posRate || 'Rs. 320 / kg'}
            </p>
          </div>
        </div>

        {/* Breakdown & Additional Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left Column: Sourcing & Costing */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
              <Settings className="w-4 h-4 text-slate-500" />
              Milk Sourcing Breakdown
            </h3>
            <div className="space-y-2.5 divide-y divide-slate-200/60 text-slate-700">
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-500">Source Pattern:</span>
                <span className="font-medium text-slate-800">
                  {batch.source || 'Farm Milk'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-semibold">Total Input:</span>
                <span className="font-mono font-black text-slate-900">
                  {batch.milkUsed}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Processing Details */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
              <CheckCircle className="w-4 h-4 text-slate-500" />
              Processing Metrics
            </h3>
            <div className="space-y-2.5 divide-y divide-slate-200/60 text-slate-700">
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-500">Pipeline Stage:</span>
                <span className="font-bold text-slate-800">
                  {batch.stage === 'incubating' ? 'Setting / Incubating' : batch.stage === 'chilled' ? 'Chilled / Ready' : batch.stage === 'pos' ? 'At POS Counter' : 'Sold Out'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold text-slate-800">
                  {batch.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Process Loss (Evaporation):</span>
                <span className="font-mono font-bold text-rose-600">
                  {batch.milkUsedVal && batch.outputVal ? `${(batch.milkUsedVal - batch.outputVal).toFixed(2)} kg (1.5%)` : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-semibold">Net Output Yield:</span>
                <span className="font-mono font-black text-slate-900">
                  {batch.output}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
