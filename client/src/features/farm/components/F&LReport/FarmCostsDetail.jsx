import React, { useState } from 'react';
import { ArrowLeft, Receipt, DollarSign, PieChart as PieIcon, Calendar, Filter } from 'lucide-react';

export default function FarmCostsDetail({ data, onClose, onBack }) {
  const handleBack = onBack || onClose;

  const {
    totalFarmCost = 0,
    categoryBreakdown = [],
    expenseList = [],
  } = data || {};

  const [selectedCatFilter, setSelectedCatFilter] = useState('All');

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  const filteredExpenses = selectedCatFilter === 'All'
    ? expenseList
    : expenseList.filter((e) => {
        const cat = (e.category || '').toLowerCase();
        return cat.includes(selectedCatFilter.toLowerCase());
      });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Navigation Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Farm P&L
          </button>
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">Farm Costs Detail</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                  Operating Expenses
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Logged Bills: <strong className="text-slate-800 font-bold">{expenseList.length} Transactions</strong>
          </span>
        </div>
      </div>

      {/* Total Cost Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-rose-100 uppercase tracking-wider">
            Total Farm Operating Expenses
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
            {expenseList.length} Records Logged
          </span>
        </div>
        <div className="text-3xl md:text-4xl font-black tracking-tight tabular my-2">
          {fmt(totalFarmCost)}
        </div>
        <p className="text-xs text-rose-100/90">
          Direct and indirect operational expenditures across herd management, feed, labor &amp; machinery.
        </p>
      </div>

      {/* 2-Column Grid: Category Breakdown on Left, Itemized List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-Wise Costs Breakdown Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <PieIcon className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Category-Wise Costs Breakdown</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Farm Budget Share
            </span>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                      style={{ backgroundColor: cat.color || '#e11d48' }}
                    />
                    <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 tabular">{fmt(cat.amount)}</span>
                    <span className="ml-2 text-[11px] font-bold text-slate-500 tabular">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, cat.percentage)}%`,
                      backgroundColor: cat.color || '#e11d48',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Expenses List from Context */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Itemized Expense Log</h3>
              <p className="text-[11px] text-slate-400">Fetched directly from ExpenseContext</p>
            </div>

            {/* Category Quick Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {['All', 'Feed', 'Veterinary', 'Labor', 'Energy', 'Maintenance'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedCatFilter(opt)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedCatFilter === opt
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <p className="font-semibold text-slate-500">No expense records found</p>
              <p className="text-[11px] text-slate-400 mt-1">Try switching the category filter or check date settings.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
              {filteredExpenses.map((exp, idx) => (
                <div key={exp.id || idx} className="py-3 px-2 flex items-start justify-between text-xs gap-3 hover:bg-slate-50/80 rounded-xl transition">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {exp.description || exp.category || 'Farm Expense'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-100/80">
                        {exp.category}
                      </span>
                      {exp.date && (
                        <span className="flex items-center gap-1 font-medium text-slate-400">
                          <Calendar className="w-2.5 h-2.5" />
                          {exp.date}
                        </span>
                      )}
                      {exp.paymentMethod && (
                        <span className="text-slate-400">&bull; {exp.paymentMethod}</span>
                      )}
                      {exp.authorizedBy && (
                        <span className="text-slate-400">&bull; Auth: {exp.authorizedBy}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-rose-600 tabular text-sm">{fmt(exp.amount)}</p>
                    {exp.receiptRef && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {exp.receiptRef}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
