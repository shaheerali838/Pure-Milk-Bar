import * as React from "react"
import { cva } from "class-variance-authority"
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Green (Completed / Active / Paid)
        green: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        
        // Amber (Pending / Warning / Due Soon)
        amber: "bg-amber-50 text-amber-700 border-amber-200/80",
        
        // Rose (Cancelled / Overdue / Error)
        rose: "bg-rose-50 text-rose-700 border-rose-200/80",
        destructive: "bg-rose-50 text-rose-700 border-rose-200/80",
        
        // Indigo (Processing / In-Transit / Info)
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
        
        // Slate (Draft / Neutral / Inactive)
        slate: "bg-slate-100 text-slate-700 border-slate-200",
        default: "bg-slate-100 text-slate-700 border-slate-200",
        outline: "text-slate-700 border-slate-300",
      },
    },
    defaultVariants: {
      variant: "slate",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
