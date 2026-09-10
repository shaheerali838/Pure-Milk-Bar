import React from 'react';
import { BookOpen, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function LedgerStatsCards({
  openingBalance = 0,
  openingDate = '',
  totalCharged = 0,
  chargedCount = 0,
  totalPaid = 0,
  paidCount = 0,
  currentBalance = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
      {/* Opening Balance */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            OPENING BALANCE
          </span>
          <div className="text-base font-black text-slate-800 mt-0.5">
            Rs. {Number(openingBalance || 0).toLocaleString()}
          </div>
          <p className="text-[9px] text-slate-400">{openingDate || 'Start of period'}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Total Charged */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" /> TOTAL CHARGED (MILK)
          </span>
          <div className="text-base font-black text-rose-600 mt-0.5">
            Rs. {Number(totalCharged || 0).toLocaleString()}
          </div>
          <p className="text-[9px] text-slate-400">{chargedCount} transactions</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Total Paid */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-0.5">
            <TrendingDown className="w-2.5 h-2.5" /> TOTAL PAID
          </span>
          <div className="text-base font-black text-emerald-600 mt-0.5">
            Rs. {Number(totalPaid || 0).toLocaleString()}
          </div>
          <p className="text-[9px] text-slate-400">{paidCount} payments</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <TrendingDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Current Balance (Due) */}
      <div className="bg-white p-3 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            CURRENT BALANCE (DUE)
          </span>
          <div className="text-base font-black text-rose-700 mt-0.5">
            Rs. {Number(currentBalance || 0).toLocaleString()}
          </div>
          <p className="text-[9px] font-semibold text-rose-600">
            {currentBalance > 0 ? 'Pending recovery' : 'All Dues Cleared'}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
          <AlertCircle className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
