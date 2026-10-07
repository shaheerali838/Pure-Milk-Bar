import React from 'react';
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  CheckCircle2,
  CreditCard,
  User,
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-8 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-100 bg-white rounded-lg shadow-2xs cursor-pointer gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
            </Button>

            {/* Month Picker with Clear/All button */}
            <div className="flex items-center gap-1">
              <div className="w-[140px] sm:w-[160px]">
                <Input
                  type="month"
                  value={selectedMonth || ''}
                  onChange={(e) => onChangeMonth(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50/80 border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:border-emerald-500 cursor-pointer shadow-none"
                />
              </div>
              {selectedMonth && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChangeMonth('')}
                  title="Show All Records"
                  className="h-8 px-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  All
                </Button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAddDebit}
              disabled={!selectedCustomerId}
              className="h-8 px-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 cursor-pointer gap-1 rounded-lg shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Manual Debit</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenRecordPayment}
              disabled={!selectedCustomerId}
              className="h-8 px-2.5 text-xs font-semibold text-blue-700 hover:text-blue-800 border-blue-200/80 bg-blue-50/40 hover:bg-blue-100/60 cursor-pointer gap-1 rounded-lg shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Record Payment</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onOpenBuyModal}
              disabled={!selectedCustomerId}
              className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5 rounded-lg shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Buy / Add Order</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSettleKhata}
              disabled={!selectedCustomerId}
              className="h-8 px-2.5 text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 cursor-pointer gap-1 rounded-lg shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settle Khata</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
