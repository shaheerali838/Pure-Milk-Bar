import React, { useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { useGlobalDate } from '@/context/GlobalDateContext';
import { getLocalDate } from '@/utils/dateUtils';

/**
 * Reusable DateHeader component for Pure Milk Bar ERP
 * 
 * Strict "Starts with Today" Rule:
 * Defaults to current date (local timezone YYYY-MM-DD).
 * Allows user to navigate previous/next days or pick a specific date.
 * If viewing a historical date, displays a badge and quick reset to 'Today'.
 */
export default function DateHeader({
  date,
  setDate,
  title,
  subtitle,
  compact = false,
  className = '',
}) {
  const globalDateCtx = useGlobalDate();

  // Resolve active date: prop or global context
  const todayISO = useMemo(() => getLocalDate(), []);
  const activeDate = date || globalDateCtx.selectedDate || todayISO;
  const setActiveDate = setDate || globalDateCtx.setSelectedDate;

  const isToday = activeDate === todayISO;

  // Format date for human friendly display: e.g. "Monday, 12 Oct 2026"
  const formattedDisplay = useMemo(() => {
    try {
      const parts = String(activeDate).slice(0, 10).split('-').map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-GB', {
          weekday: compact ? 'short' : 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    } catch (_) {}
    return activeDate;
  }, [activeDate, compact]);

  const handlePrevDay = () => {
    try {
      const parts = String(activeDate).slice(0, 10).split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setDate(d.getDate() - 1);
      const prev = getLocalDate(d);
      setActiveDate(prev);
    } catch (_) {}
  };

  const handleNextDay = () => {
    try {
      const parts = String(activeDate).slice(0, 10).split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setDate(d.getDate() + 1);
      const next = getLocalDate(d);
      setActiveDate(next);
    } catch (_) {}
  };

  const handleResetToday = () => {
    setActiveDate(todayISO);
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs ${className}`}>
        <button
          type="button"
          onClick={handlePrevDay}
          title="Previous Day"
          className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          <Calendar className={`w-3.5 h-3.5 ${isToday ? 'text-emerald-600' : 'text-amber-600'}`} />
          <input
            type="date"
            value={activeDate}
            onChange={(e) => e.target.value && setActiveDate(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer w-[110px]"
            title={`Active Filter Date: ${formattedDisplay}`}
          />
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          title="Next Day"
          className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {!isToday && (
          <button
            type="button"
            onClick={handleResetToday}
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 transition cursor-pointer flex items-center gap-1"
            title="Reset strictly to Today"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Today
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all ${
        isToday
          ? 'bg-gradient-to-r from-emerald-50/60 via-white to-emerald-50/30 border-emerald-200/80 shadow-2xs'
          : 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border-amber-300 shadow-xs'
      } ${className}`}
    >
      {/* Title / Description */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isToday
              ? 'bg-emerald-100/70 border-emerald-200 text-emerald-700'
              : 'bg-amber-100/80 border-amber-300 text-amber-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          {title ? (
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {title}
              </h2>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isToday
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                }`}
              >
                {isToday ? 'Today (Active)' : 'Historical Filter'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800">
                Active Date Filter:
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isToday
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {isToday ? 'Today' : 'Past Date'}
              </span>
            </div>
          )}
          <p className="text-[11px] text-slate-500 truncate">
            {subtitle || formattedDisplay}
          </p>
        </div>
      </div>

      {/* Date Control Toolbar */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 bg-white/90 p-1 rounded-xl border border-slate-200/90 shadow-2xs">
        <button
          type="button"
          onClick={handlePrevDay}
          title="Previous Day"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">
          <input
            type="date"
            value={activeDate}
            onChange={(e) => e.target.value && setActiveDate(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer w-[115px]"
            title="Click to choose a date"
          />
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          title="Next Day"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {!isToday && (
          <button
            type="button"
            onClick={handleResetToday}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition cursor-pointer ml-1"
            title="Reset view to Today"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Today</span>
          </button>
        )}
      </div>
    </div>
  );
}
