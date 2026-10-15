import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { useGlobalDate } from '@/context/GlobalDateContext';
import { useDailyClose } from '@/context/DailyCloseContext';
import {
  PageSkeleton,
  DashboardSkeleton,
  PosSkeleton,
} from '@/components/ui/skeleton';

export default function Layout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { setToday } = useGlobalDate();
  const { isDayClosed, reopenDay } = useDailyClose();

  const handleReopenDay = async () => {
    try {
      await reopenDay('Day reopened by user from global banner');
      toast.success('Day successfully reopened! Website operations are now ACTIVE.');
    } catch (err) {
      toast.error('Failed to reactivate day: ' + err.message);
    }
  };

  // Close mobile sidebar and STRICTLY enforce 'Today' on route transition
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    if (typeof setToday === 'function') {
      setToday();
    }
  }, [location.pathname, setToday]);

  const getFallbackSkeleton = () => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path.startsWith('/dashboard')) {
      return <DashboardSkeleton />;
    }
    if (path.startsWith('/pos')) {
      return <PosSkeleton />;
    }
    return <PageSkeleton />;
  };

  return (
    <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex min-h-0 min-w-0 flex-col overflow-hidden">
        <Navbar onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />

        {/* Global Day Closed Inactivity Alert Banner */}
        {isDayClosed && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 text-white px-3 sm:px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm shrink-0 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
              </span>
              <span className="font-extrabold uppercase tracking-wider text-[11px] bg-amber-900/60 px-2 py-0.5 rounded border border-amber-400/40 shrink-0">
                Day Closed
              </span>
              <span className="font-semibold truncate text-slate-100">
                Operations are Inactive (Intake, POS Sales, Purchases &amp; Dahi locked).
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                type="button"
                onClick={handleReopenDay}
                className="bg-white text-slate-900 hover:bg-amber-50 active:scale-95 px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-blue-600" />
                <span>Reopen Day &amp; Activate Website</span>
              </button>
              <Link
                to="/finance/daily-closing"
                className="underline text-amber-100 hover:text-white font-medium text-xs hidden md:inline ml-1"
              >
                View Closing
              </Link>
            </div>
          </div>
        )}

        <main
          className={`min-h-0 flex-1 ${
            location.pathname.toLowerCase().startsWith('/pos')
              ? 'flex flex-col overflow-hidden p-2 sm:p-2.5'
              : 'overflow-x-hidden overflow-y-auto overscroll-contain p-2 sm:p-3 md:p-4'
          }`}
        >
          <Suspense fallback={getFallbackSkeleton()}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
