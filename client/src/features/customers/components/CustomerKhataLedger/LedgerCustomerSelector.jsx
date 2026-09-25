import React from 'react';
import {
  User,
  Plus,
  ShoppingCart,
  CheckCircle2,
  Calendar,
  CreditCard,
  Eye,
  Search,
} from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LedgerCustomerSelector({
  selectedCustomerId,
  onSelectCustomer,
  selectedMonth,
  onChangeMonth,
  onViewCustomerDetails,
  onOpenBuyModal,
  onOpenAddDebit,
  onOpenRecordPayment,
  onSettleKhata,
}) {
  const { customers } = useCustomerContext();

  return (
    <Card className="bg-white border-slate-200/80 shadow-2xs">
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Controls: Customer Dropdown (slightly smaller) + Month Picker (slightly wider) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Customer Selector - Compact */}
            <div className="w-[200px] sm:w-[220px]">
              <Select
                value={selectedCustomerId ? String(selectedCustomerId) : ''}
                onValueChange={(val) => onSelectCustomer(val)}
              >
                <SelectTrigger className="w-full h-8 px-2 bg-slate-50/80 border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-none">
                  <SelectValue
                    placeholder={
                      customers.length === 0
                        ? 'No customers'
                        : 'Select customer...'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {customers.map((c) => {
                    const bal = Number(c.khataBalance || 0);
                    return (
                      <SelectItem
                        key={c.id}
                        value={String(c.id)}
                        className="text-xs font-medium cursor-pointer py-1.5"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                            {c.name}
                          </span>
                          <span
                            className={`font-mono text-[9px] font-bold px-1 py-0.2 rounded shrink-0 ${
                              bal > 0
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {bal > 0 ? `Rs.${bal.toLocaleString()}` : '0 Due'}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Month Picker - Expanded / Larger with Clear/All button */}
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
                  title="Show All Records (تمام کھاتہ دیکھیں)"
                  className="h-8 px-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  All
                </Button>
              )}
            </div>
          </div>

          {/* Right Action Buttons: Single Horizontal Row */}
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
