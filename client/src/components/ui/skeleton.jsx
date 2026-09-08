import * as React from "react"
import { cn } from "@/utils/cn"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  )
}

function TableSkeleton({ rows = 5, cols = 4, className }) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex gap-4 pb-2 border-b border-slate-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function KpiCardSkeleton({ className }) {
  return (
    <div className={cn("p-5 rounded-xl border border-slate-200/80 bg-white space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

function LedgerRowSkeleton({ count = 3, className }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  )
}

export { Skeleton, TableSkeleton, KpiCardSkeleton, LedgerRowSkeleton }
