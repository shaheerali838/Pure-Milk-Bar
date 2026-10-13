import React from 'react';
import { BookOpen, HelpCircle, Printer, Download } from 'lucide-react';

export default function LedgerHeader({ onHowToFinish, onPrint, onExportCSV }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
            Customer Khata Ledger
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Dues &amp; Settlements
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              Active Khata
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onHowToFinish}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>How to Finish Khata?</span>
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Statement</span>
        </button>
        {onExportCSV && (
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-2" />
            <span>Export CSV</span>
          </button>
        )}
      </div>
    </div>
  );
}
