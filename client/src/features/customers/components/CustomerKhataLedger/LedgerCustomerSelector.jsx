import React from 'react';
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function LedgerCustomerSelector({
  selectedCustomerId,
  selectedMonth,
  onChangeMonth,
  onOpenBuyModal,
  onOpenAddDebit,
  onOpenRecordPayment,
  onSettleKhata,
  onBack,
}) {
  return (
    <Card className="bg-white border-slate-200/80 shadow-2xs">
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Controls: Back Button + Month Picker */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Back Button */}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
            </button>

            {/* Month Picker with Clear/All button */}
            <div className="flex items-center gap-1">
              <div className="w-[140px] sm:w-[160px]">
                <Input
                  type="month"
                  value={selectedMonth || ''}
                  onChange={(e) => onChangeMonth(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50/80 border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-emerald-500 cursor-pointer shadow-none"
                />
              </div>
              {selectedMonth && (
                <button
                  type="button"
                  onClick={() => onChangeMonth('')}
                  title="Show All Records"
                  className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                >
                  All
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenAddDebit}
              disabled={!selectedCustomerId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Manual Debit</span>
            </button>

            <button
              type="button"
              onClick={onOpenRecordPayment}
              disabled={!selectedCustomerId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Record Payment</span>
            </button>

            <button
              type="button"
              onClick={onOpenBuyModal}
              disabled={!selectedCustomerId}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Buy / Add Order</span>
            </button>

            <button
              type="button"
              onClick={onSettleKhata}
              disabled={!selectedCustomerId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settle Khata</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
