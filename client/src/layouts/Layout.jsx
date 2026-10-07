import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import {
  PageSkeleton,
  DashboardSkeleton,
  PosSkeleton,
} from '@/components/ui/skeleton';

export default function Layout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

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
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-2 sm:p-3 md:p-4">
          <Suspense fallback={getFallbackSkeleton()}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
