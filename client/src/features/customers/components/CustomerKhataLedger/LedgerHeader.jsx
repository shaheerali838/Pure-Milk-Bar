import React from 'react';
import { HelpCircle, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LedgerHeader({ onHowToFinish, onPrint, onExportCSV }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 font-display">
          Customer Khata Ledger
        </h1>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          Dues &amp; Settlements
        </span>
        <span className="hidden md:inline text-xs text-slate-400">|</span>
        <p className="hidden md:inline text-xs text-slate-500">
          Itemized billing history, payments received &amp; debt clearance
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onHowToFinish}
          className="h-7.5 px-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>How to Finish Khata?</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="h-7.5 px-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer gap-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Statement</span>
        </Button>
        {onExportCSV && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="h-7.5 px-2.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 shadow-2xs cursor-pointer gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </Button>
        )}
      </div>
    </div>
  );
}
