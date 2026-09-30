import React from 'react';
import {
  Calendar,
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPktDisplay, getPktTodayString } from '@/utils/dateUtils';

export default function DailyClosingHeader({
  period = 'today',
  onPeriodChange,
  status = 'OPEN',
  selectedDate = getPktTodayString(),
  onDateChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onExportCsv,
  onOpenConfirmDialog,
  onOpenReopenDialog,
  closingInfo = null,
  isAdmin = false,
  isRefreshing = false,
}) {
  const isClosed = ['CLOSED', 'APPROVED', 'LOCKED', 'RECONCILED'].includes(status);
  const isRangeMode = period !== 'today';

  const statusBadge = () => {
    if (isClosed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Day Closed & Locked
        </span>
      );
    }
    if (status === 'REOPENED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
          <Unlock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Reopened for Revisions
        </span>
      );
    }
    if (isRangeMode) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Multi-Day Summary
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 animate-pulse">
        <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        Live In-Progress (Open)
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all space-y-4">
      {/* Top row: Title + Status + Action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Day End Summary
            </h1>
            {statusBadge()}
            {isRefreshing && (
              <span className="text-xs text-slate-400 dark:text-slate-500 animate-pulse">
                Syncing live...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time reconciliation of dairy stock, POS counter sales, doorstep deliveries & cash flow.
          </p>
          {isClosed && closingInfo?.closedBy && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Closed by <span className="font-semibold">{closingInfo.closedBy}</span> on{' '}
              {formatPktDisplay(closingInfo.closedAt || selectedDate, true)}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium h-9 gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            Export CSV
          </Button>

          {isClosed && isAdmin && onOpenReopenDialog && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenReopenDialog}
              className="border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40 text-xs sm:text-sm font-medium h-9 gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              Reopen Day
            </Button>
          )}

          {!isRangeMode && (
            <Button
              type="button"
              size="sm"
              disabled={isClosed}
              onClick={onOpenConfirmDialog}
              className={`h-9 px-4 font-semibold text-xs sm:text-sm gap-2 transition-all shadow-sm ${
                isClosed
                  ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-emerald-600/30'
              }`}
            >
              <Lock className="w-4 h-4" />
              {isClosed ? 'Day Already Confirmed' : 'Confirm Daily Closing'}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row: Period selection & Date picker */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Period selector dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Period:
            </span>
            <select
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="h-9 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="today">Today (Single Day)</option>
              <option value="weekly">Last 7 Days (Weekly)</option>
              <option value="monthly">Last 30 Days (Monthly)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Date Selector */}
          {period === 'today' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Date:
              </span>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="h-9 pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : period === 'custom' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-9 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-9 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
              />
            </div>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400 italic">
              Showing aggregated metrics for {period}
            </span>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
          <span>Timezone:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">PKT (Asia/Karachi)</span>
        </div>
      </div>
    </div>
  );
}
