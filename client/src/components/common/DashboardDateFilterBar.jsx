import React from 'react';
import { Calendar, X, Clock } from 'lucide-react';
import { getDateRangeBoundaries } from '@/utils/dateUtils';

export const DATE_FILTER_TABS = [
  { id: 'today',      label: 'Today' },
  { id: 'this_week',  label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom',     label: 'Custom' },
  { id: 'all',        label: 'All Time' },
];

export default function DashboardDateFilterBar({
  dateFilter = 'today',
  setDateFilter,
  onFilterChange,
  startDate = '',
  setStartDate,
  onStartDateChange,
  endDate = '',
  setEndDate,
  onEndDateChange,
  countLabel = '',
  theme = 'emerald', // 'emerald' | 'blue' | 'indigo' | 'slate'
  className = '',
}) {
  const handleFilterChange = onFilterChange || setDateFilter;
  const handleStartDateChange = onStartDateChange || setStartDate;
  const handleEndDateChange = onEndDateChange || setEndDate;
  const boundaries = getDateRangeBoundaries(dateFilter, startDate, endDate);

  const activeThemeClasses = {
    emerald: 'bg-emerald-600 text-white shadow-sm font-bold',
    blue: 'bg-blue-600 text-white shadow-sm font-bold',
    indigo: 'bg-indigo-600 text-white shadow-sm font-bold',
    slate: 'bg-slate-900 text-white shadow-sm font-bold',
  }[theme] || 'bg-emerald-600 text-white shadow-sm font-bold';

  const iconThemeColor = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    slate: 'text-slate-700',
  }[theme] || 'text-emerald-600';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* ── Date Filter Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/70 backdrop-blur-xs p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {DATE_FILTER_TABS.map(({ id, label }) => {
            const isTabActive =
              dateFilter === id ||
              (id === 'this_week' && (dateFilter === 'week' || dateFilter === 'this_week')) ||
              (id === 'this_month' && (dateFilter === 'month' || dateFilter === 'this_month')) ||
              (id === 'all' && (dateFilter === 'all' || dateFilter === 'all_time'));

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleFilterChange && handleFilterChange(id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isTabActive
                    ? activeThemeClasses
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Period Label & Optional Count */}
        <div className="flex items-center gap-2 px-2 text-xs font-medium text-slate-500">
          <div className="inline-flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${iconThemeColor} shrink-0`} />
            <span className="font-semibold text-slate-700">{boundaries.detailedLabel}</span>
          </div>
          {countLabel && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {countLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Custom Date Range Inputs (visible when 'custom' is active) ── */}
      {dateFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-2.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Calendar className={`w-3.5 h-3.5 ${iconThemeColor} shrink-0`} />
            <span>Select Date Range:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange && handleStartDateChange(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-800 font-semibold cursor-pointer text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange && handleEndDateChange(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-800 font-semibold cursor-pointer text-xs"
              />
            </div>

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  if (handleStartDateChange) handleStartDateChange('');
                  if (handleEndDateChange) handleEndDateChange('');
                }}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-medium ml-1"
              >
                <X className="w-3 h-3" /> Clear Dates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
