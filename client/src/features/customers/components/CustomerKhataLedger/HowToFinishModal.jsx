import React from 'react';
import { X, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowToFinishModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800 font-display">How to Settle &amp; Finish Khata</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="flex items-start gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs font-display">Verify Outstanding Dues</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Check the customer's closing balance and transactions to ensure all deliveries have been billed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs font-display">Receive Full Payment</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Collect the exact remaining balance through Cash, Bank Transfer, EasyPaisa, or JazzCash.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs font-display">Click "Settle &amp; Clear Full Khata"</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Use the 1-click settlement button to automatically record full clearance and set the Khata balance to zero.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <Button
            type="button"
            onClick={onClose}
            size="sm"
            className="px-5 py-2 h-8 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition text-xs cursor-pointer shadow-none"
          >
            Got it, Close
          </Button>
        </div>
      </div>
    </div>
  );
}

