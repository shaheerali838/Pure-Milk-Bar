import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
}

function KpiCardSkeleton({ className }) {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white space-y-3 shadow-2xs",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-32 rounded-lg" />
      <Skeleton className="h-3 w-20 rounded-md" />
    </div>
  );
}

function KpiGridSkeleton({ count = 4, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 6, cols = 5, className }) {
  return (
    <div
      className={cn(
        "w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5",
        className,
      )}
    >
      {/* Table Header Row */}
      <div className="flex gap-4 pb-3 border-b border-slate-100">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-md" />
        ))}
      </div>
      {/* Table Body Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-2.5 border-b border-slate-50">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn(
                "h-4 flex-1 rounded-md",
                c === 0 ? "w-1/3" : c === cols - 1 ? "w-16" : "",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({ className }) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <div className="h-56 w-full flex items-end gap-3 pt-4 px-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-1.5 h-full">
            <Skeleton
              className="w-full rounded-t-md"
              style={{ height: `${Math.max(25, (i * 19 + 35) % 95)}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function LedgerRowSkeleton({ count = 4, className }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 bg-white shadow-2xs"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-44 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="h-4 w-20 rounded-md ml-auto" />
            <Skeleton className="h-3 w-14 rounded-md ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PageSkeleton({ title = true, kpis = true, table = true, className }) {
  return (
    <div className={cn("space-y-4 animate-in fade-in duration-150", className)}>
      {/* Header Skeleton */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        </div>
      )}

      {/* Nav Pills Skeleton */}
      <div className="flex items-center gap-2 overflow-x-hidden py-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full shrink-0" />
        ))}
      </div>

      {/* KPI Cards Strip */}
      {kpis && <KpiGridSkeleton count={4} />}

      {/* Main Table or Card Content */}
      {table && <TableSkeleton rows={7} cols={5} />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-3.5 w-40 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
      </div>

      {/* Top Summary Cards Grid */}
      <KpiGridSkeleton count={4} />

      {/* 3 Operation Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl border border-slate-200/90 bg-white space-y-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-40 rounded-lg" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-7 w-full rounded-xl" />
              <Skeleton className="h-7 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

function PosSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)]">
      {/* Product Catalog Grid (8 Cols) */}
      <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-4 flex flex-col">
        {/* Category Tabs & Search */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-10 flex-1 max-w-xs rounded-xl" />
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 flex-1 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex flex-col justify-between"
            >
              <Skeleton className="h-20 w-full rounded-lg mb-2" />
              <Skeleton className="h-4 w-24 rounded-md mb-1" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Billing Panel (4 Cols) */}
      <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-3.5 w-64 rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  TableSkeleton,
  KpiCardSkeleton,
  KpiGridSkeleton,
  LedgerRowSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  PageSkeleton,
  PosSkeleton,
  FormSkeleton,
};

