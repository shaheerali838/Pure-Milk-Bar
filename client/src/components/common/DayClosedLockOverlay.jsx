import React from 'react';
import { Lock, Sparkles, ArrowRight, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDailyClose } from '@/context/DailyCloseContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DayClosedLockOverlay({
  inline = false,
  customMessage = null,
  showAction = true,
  className = '',
}) {
  const { isDayClosed, openNewDay, reopenDay } = useDailyClose();
  const navigate = useNavigate();

  if (!isDayClosed) return null;

  const defaultMessage = 'Day is Closed. Operations are Inactive.';
  const displayMessage = customMessage || defaultMessage;

  const handleOpenNewDay = (e) => {
    e?.stopPropagation();
    openNewDay();
  };

  const handleReopenDay = async (e) => {
    e?.stopPropagation();
    try {
      await reopenDay('Day reopened by user');
      toast.success('Day successfully reopened! Website operations are now ACTIVE.');
    } catch (err) {
      toast.error('Failed to reactivate: ' + err.message);
    }
  };

  const handleNavigateClosing = (e) => {
    e?.stopPropagation();
    navigate('/finance/daily-closing');
  };

  if (inline) {
    return (
      <div
        className={`w-full p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-400 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 dark:text-amber-200 select-none shadow-sm ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-sm">
              <span>🔒 {displayMessage}</span>
            </div>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80 mt-0.5">
              Financial reconciliation is locked. Start a new business day to resume sales, milking, purchases, and expenses.
            </p>
          </div>
        </div>

        {showAction && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={handleReopenDay}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-3.5 shadow-sm shadow-blue-600/20 gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              Reopen &amp; Activate Day
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleOpenNewDay}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 shadow-sm shadow-emerald-600/20 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open New Day
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNavigateClosing}
              className="border-amber-400 text-amber-800 dark:border-amber-700 dark:text-amber-200 text-xs h-9 px-3 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              Closing Module
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 z-40 bg-slate-950/75 dark:bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200 pointer-events-auto ${className}`}
      style={{ cursor: 'not-allowed' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-md mx-auto flex flex-col items-center space-y-3.5 pointer-events-auto bg-slate-900/90 dark:bg-slate-900/95 border border-amber-500/40 p-6 rounded-2xl shadow-2xl shadow-amber-500/10">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Lock className="w-7 h-7" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5 font-display tracking-tight">
            <span>🔒 {displayMessage}</span>
          </h4>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            All daily operations are currently locked because the business day has been closed.
            Click below to open a fresh business day with carried-forward stock!
          </p>
        </div>

        {showAction && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <Button
              type="button"
              size="sm"
              onClick={handleReopenDay}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 shadow-lg shadow-blue-600/30 gap-1.5 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Reopen &amp; Activate Website
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleOpenNewDay}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shadow-lg shadow-emerald-600/30 gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Open New Day
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNavigateClosing}
              className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-9 px-3.5 gap-1.5 cursor-pointer"
            >
              View Closing Module
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
