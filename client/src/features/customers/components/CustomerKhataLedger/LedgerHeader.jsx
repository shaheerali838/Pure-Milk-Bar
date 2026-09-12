import React from 'react';
import { HelpCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LedgerHeader({ onHowToFinish, onPrint }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight font-display">
          Khata Ledger &amp; Dues Clearance
        </h2>
        <p className="text-[11px] text-slate-500">
          Digital ledger management, customer Khata settlements, and clearance slips
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onHowToFinish}
          className="flex items-center gap-1 px-2.5 py-1 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold shadow-2xs transition cursor-pointer"
        >
          <HelpCircle className="w-3 h-3 text-slate-500" />
          How to Finish Khata?
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="flex items-center gap-1 px-2.5 py-1 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold shadow-2xs transition cursor-pointer"
        >
          <Printer className="w-3 h-3 text-slate-500" />
          Print
        </Button>
      </div>
    </div>
  );
}


