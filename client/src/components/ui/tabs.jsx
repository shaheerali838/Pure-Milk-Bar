import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva } from "class-variance-authority"
import { cn } from "@/utils/cn"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  "inline-flex items-center justify-center p-1 text-slate-500",
  {
    variants: {
      variant: {
        // Pill style (POS / Default)
        pills: "h-10 rounded-lg bg-slate-100 p-1 text-slate-600 gap-1",
        default: "h-10 rounded-lg bg-slate-100 p-1 text-slate-600 gap-1",
        
        // Underline style (Ledgers)
        underline: "h-10 border-b border-slate-200 bg-transparent p-0 gap-6 w-full justify-start rounded-none",
      },
    },
    defaultVariants: {
      variant: "pills",
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Pill style
        pills: "rounded-md px-3.5 py-1.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:font-semibold data-[state=active]:shadow-xs",
        default: "rounded-md px-3.5 py-1.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:font-semibold data-[state=active]:shadow-xs",
        
        // Underline style
        underline: "rounded-none border-b-2 border-transparent px-1 pb-2 pt-1.5 text-slate-500 hover:text-slate-900 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:font-semibold",
      },
    },
    defaultVariants: {
      variant: "pills",
    },
  }
)

const TabsList = React.forwardRef(({ className, variant = "pills", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, variant = "pills", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
