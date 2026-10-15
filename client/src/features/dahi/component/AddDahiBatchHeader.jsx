import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function AddDahiBatchHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dahi Pipeline
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
            Record New Dahi Batch
          </h1>
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        New Batch
      </span>
    </div>
  );
}
