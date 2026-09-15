import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, DollarSign, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HowToFinishView({ onBack }) {
  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
            How to Settle &amp; Close Khata Accounts
          </h1>
          <p className="text-xs text-slate-500">
            Standard operating guidelines for closing monthly Khata and clearing customer balances
          </p>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 border-t-3 border-t-emerald-500">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="text-xs font-bold text-slate-900 font-display">1. Verify Outstanding Dues</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Check the customer's closing balance and transactions to ensure all daily milk deliveries, dahi, or extra orders have been logged.
          </p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 border-t-3 border-t-blue-500">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-xs font-bold text-slate-900 font-display">2. Receive Payment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Collect the exact remaining balance via Cash, EasyPaisa, JazzCash, or Bank Transfer, and note the Transaction ID if paid digitally.
          </p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 border-t-3 border-t-purple-500">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-xs font-bold text-slate-900 font-display">3. 1-Click Settle &amp; Clear</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Click &quot;Settle &amp; Clear Khata&quot; or use &quot;Record Payment (Full Payment)&quot; to instantly record settlement and zero-out the ledger balance.
          </p>
        </Card>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="px-5 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
        >
          Back to Khata Ledger
        </Button>
      </div>
    </div>
  );
}
