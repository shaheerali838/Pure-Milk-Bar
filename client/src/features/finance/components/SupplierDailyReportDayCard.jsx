import React from 'react';
import { Calendar, Droplets, Banknote, Receipt, CheckCircle2 } from 'lucide-react';
import { getLocalDate } from '@/utils/dateUtils';

export default function SupplierDailyReportDayCard({ day }) {
  if (!day) return null;

  const todayStr = getLocalDate();
  const isToday = day.date === todayStr;
  const isProfitable = day.supplierNetProfit >= 0;

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
      {/* Header Bar */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-sm">{displayDateStr}</span>
          {isToday && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Today (Live)
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-medium text-slate-400">Purchases:</span>
            <strong className="font-bold font-mono text-rose-600">
              - Rs. {day.totalCost.toLocaleString()}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-medium text-slate-400">Sales:</span>
            <strong className="font-bold font-mono text-emerald-700">
              + Rs. {day.supplierTotalSalesRev.toLocaleString()}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-medium text-slate-400">Expenses:</span>
            <strong className="font-bold font-mono text-amber-700">
              - Rs. {day.supplierExpensesTotal.toLocaleString()}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400">Net:</span>
            <strong
              className={`font-bold font-mono px-2 py-0.5 rounded ${
                isProfitable ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isProfitable ? '+' : '-'} Rs. {Math.abs(day.supplierNetProfit).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Data Grid: 3 Columns (Procurement/Purchases, POS Resale, Expenses) */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
        {/* Col 1: Milk Purchased from Suppliers */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Milk Purchased from Suppliers</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {day.intakeEntries ? day.intakeEntries.length : 0} Invoices
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Volume Purchased</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {day.supplierIntake.toFixed(1)} L
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Purchase Total Bill</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                Rs. {day.totalCost.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className="text-emerald-700 font-medium">Paid: Rs. {day.paidAmount.toLocaleString()}</span>
              <span className="font-bold text-amber-700">Due: Rs. {day.pendingAmount.toLocaleString()}</span>
            </div>

            {day.intakeEntries && day.intakeEntries.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Purchases Log ({day.intakeEntries.length})
                </span>
                <div className="max-h-20 overflow-y-auto space-y-1">
                  {day.intakeEntries.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="truncate pr-1">{log.supplierName || 'Supplier'} ({log.quantity}L)</span>
                      <span className="font-mono font-semibold text-slate-800 shrink-0">Rs. {Number(log.totalCost).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Col 2: POS Resale (Milk + Dahi) */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supplier Milk &amp; Dahi Sales</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {day.saleItems ? day.saleItems.length : 0} Sales Items
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Supplier Milk Sold</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {day.supplierMilkSalesQty.toFixed(1)} L (Rs. {day.supplierMilkSalesRev.toLocaleString()})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Supplier Dahi Sold</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {day.supplierDahiSalesQty.toFixed(1)} kg (Rs. {day.supplierDahiSalesRev.toLocaleString()})
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-700 font-semibold">Total Sales Revenue</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                Rs. {day.supplierTotalSalesRev.toLocaleString()}
              </span>
            </div>

            {day.saleItems && day.saleItems.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sales Items Log
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

        {/* Col 3: Sourcing Expenses & Net Profit */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Receipt className="w-3.5 h-3.5 text-amber-600" />
              <span>Supplier Expenses &amp; Profit</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {day.expenseItems ? day.expenseItems.length : 0} Vouchers
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Supplier Sourcing Cost</span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                Rs. {day.supplierExpensesTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-700 font-semibold">Net Profit</span>
              <span
                className={`font-mono font-bold text-sm ${
                  isProfitable ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isProfitable ? '+' : '-'} Rs. {Math.abs(day.supplierNetProfit).toLocaleString()}
              </span>
            </div>

            {day.expenseItems && day.expenseItems.length > 0 ? (
              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
              <p className="text-[11px] text-slate-400 italic pt-2">No overhead expenses for this date.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
        <span className="text-slate-400">
          Procurement Status:{' '}
          <strong className="text-white ml-1 font-mono">
            {day.intakeEntries ? day.intakeEntries.length : 0} Milk Deliveries
          </strong>
        </span>
        <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED (SALES - PURCHASE COST - EXPENSES = NET PROFIT)
        </span>
      </div>
    </div>
  );
}
