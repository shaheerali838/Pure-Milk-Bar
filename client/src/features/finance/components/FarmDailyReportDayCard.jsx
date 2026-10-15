import React from 'react';
import { Calendar, Droplets, Banknote, Receipt, CheckCircle2 } from 'lucide-react';
import { getLocalDate } from '@/utils/dateUtils';

export default function FarmDailyReportDayCard({ day, currentAvailableStock, milkingAnimalsCount }) {
  if (!day) return null;

  const todayStr = getLocalDate();
  const isToday = day.date === todayStr;
  const balance = isToday
    ? currentAvailableStock
    : Math.max(0, day.farmYield - (day.farmMilkSalesQty + (day.farmMilkConvertedToDahi || 0)));
  const isProfitable = day.farmNetProfit >= 0;

  const displayDateStr = day.date
    ? new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown Date';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Card Header with Financial Snapshot */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-sm">{displayDateStr}</span>
          {isToday && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Today (Live)
            </span>
          )}
          {day.isHerdBaseline && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Herd Yield Baseline
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-medium text-slate-400">Sales:</span>
            <strong className="font-bold font-mono text-emerald-700">
              + Rs. {day.farmTotalSalesRev.toLocaleString()}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-medium text-slate-400">Expenses:</span>
            <strong className="font-bold font-mono text-rose-600">
              - Rs. {day.farmExpensesTotal.toLocaleString()}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400">Net Profit:</span>
            <strong
              className={`font-bold font-mono px-2 py-0.5 rounded ${
                isProfitable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isProfitable ? '+' : '-'} Rs. {Math.abs(day.farmNetProfit).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Data Grid: 3 Columns (Production, POS Sales, Expenses) */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
        {/* Col 1: Milking Yield */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Droplets className="w-3.5 h-3.5 text-emerald-600" />
              Farm Production Yield
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {milkingAnimalsCount} In-Milking
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Milked Volume</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {day.farmYield.toFixed(1)} L
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Available Stock</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                {balance.toFixed(1)} L
              </span>
            </div>

            {day.shiftLogs && day.shiftLogs.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recorded Shifts ({day.shiftLogs.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {day.shiftLogs.map((log, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md"
                    >
                      {log.shift || 'Shift'}: {log.yieldLiters || log.yield} L ({log.animalTag || 'Cattle'})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Col 2: Farm Sales (Milk + Dahi) */}
        <div className="p-4 space-y-3 bg-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              Farm POS Sales (Milk &amp; Dahi)
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {day.saleItems ? day.saleItems.length : 0} Sales Items
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Farm Milk Sold</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {day.farmMilkSalesQty.toFixed(1)} L (Rs. {day.farmMilkSalesRev.toLocaleString()})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Farm Dahi Sold</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {day.farmDahiSalesQty.toFixed(1)} kg (Rs. {day.farmDahiSalesRev.toLocaleString()})
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-100">
              <span className="text-slate-700 font-semibold">Total Day Sales</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                Rs. {day.farmTotalSalesRev.toLocaleString()}
              </span>
            </div>

            {day.saleItems && day.saleItems.length > 0 && (
              <div className="mt-2 pt-2 border-t border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Recent Sales Log
                </span>
                <div className="max-h-20 overflow-y-auto space-y-1">
                  {day.saleItems.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>{item.name} &times; {item.quantity}</span>
                      <span className="font-mono font-semibold text-slate-800">Rs. {item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Farm Operational Expenses */}
        <div className="p-4 space-y-3 bg-rose-50/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Receipt className="w-3.5 h-3.5 text-rose-600" />
              Farm Expenses
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {day.expenseItems ? day.expenseItems.length : 0} Vouchers
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Day Total Expenses</span>
              <span className="font-mono font-bold text-rose-600 text-sm">
                Rs. {day.farmExpensesTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-rose-100">
              <span className="text-slate-700 font-semibold">Day Net Profit</span>
              <span
                className={`font-mono font-bold text-sm ${
                  isProfitable ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isProfitable ? '+' : '-'} Rs. {Math.abs(day.farmNetProfit).toLocaleString()}
              </span>
            </div>

            {day.expenseItems && day.expenseItems.length > 0 ? (
              <div className="mt-2 pt-2 border-t border-rose-100 space-y-1">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                  Expense Vouchers
                </span>
                <div className="max-h-20 overflow-y-auto space-y-1">
                  {day.expenseItems.map((exp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="truncate pr-1">{exp.category || exp.title || 'Expense'}</span>
                      <span className="font-mono font-semibold text-rose-600 shrink-0">Rs. {Number(exp.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic pt-2">No expenses logged for this day.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Card Summary Bar */}
      <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
        <span className="text-slate-400">
          Daily Unit Performance:{' '}
          <strong className="text-white ml-1 font-mono">
            {milkingAnimalsCount > 0 ? (day.farmYield / milkingAnimalsCount).toFixed(1) : 0} L/cow
          </strong>
        </span>
        <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED (SALES - EXPENSES = NET PROFIT)
        </span>
      </div>
    </div>
  );
}
