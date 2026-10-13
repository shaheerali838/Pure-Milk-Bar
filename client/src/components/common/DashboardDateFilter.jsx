import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * Reusable Dashboard Date & Timeframe Filter Toolbar
 * 
 * Provides segmented timeframe tabs (Today, This Week, This Month, All Time, Custom Range)
 * and interactive From/To date pickers with Clear action.
 */
export default function DashboardDateFilter({
  timeRange = 'today',
  setTimeRange,
  customStartDate = '',
  setCustomStartDate,
  customEndDate = '',
  setCustomEndDate,
  showAll = true,
  activeTheme = 'emerald', // 'emerald' | 'blue' | 'navy' | 'purple'
  className = '',
}) {
  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    ...(showAll ? [{ id: 'all', label: 'All Time' }] : []),
    { id: 'custom', label: 'Custom Range' },
  ];

  const themeActiveStyles = {
    emerald: 'bg-white text-emerald-700 shadow-xs font-bold',
    blue: 'bg-white text-blue-700 shadow-xs font-bold',
    navy: 'bg-white text-slate-900 shadow-xs font-bold',
    purple: 'bg-white text-purple-700 shadow-xs font-bold',
  };

  const activeClass = themeActiveStyles[activeTheme] || themeActiveStyles.emerald;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Timeframe Segmented Control Tabs */}
      <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold self-start sm:self-auto shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTimeRange(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === tab.id
                ? activeClass
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker Container */}
      {timeRange === 'custom' && (
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs shadow-2xs animate-in fade-in duration-150">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-500">From:</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 cursor-pointer"
          />
          <span className="text-[11px] font-semibold text-slate-500">To:</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 cursor-pointer"
          />
          {(customStartDate || customEndDate) && (
            <button
              type="button"
              onClick={() => {
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="text-[10px] font-bold text-rose-600 hover:underline ml-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
