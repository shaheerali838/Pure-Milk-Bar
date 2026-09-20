import * as React from "react"
import { cn } from "@/utils/cn"

const Input = React.forwardRef(({ className, type, prefix, suffix, error, onWheel, ...props }, ref) => {
  const hasWrapper = Boolean(prefix || suffix)

  const handleWheel = (e) => {
    if (type === "number") {
      e.currentTarget.blur()
    }
    if (onWheel) {
      onWheel(e)
    }
  }

  const inputElement = (
    <input
      type={type}
      onWheel={handleWheel}
      className={cn(
        "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-rose-500 focus-visible:ring-rose-500 focus-visible:border-rose-500",
        prefix && "pl-8",
        suffix && "pr-12",
        className
      )}
      ref={ref}
      {...props}
    />
  )

  if (!hasWrapper) {
    return inputElement
  }

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <div className="absolute left-3 flex items-center pointer-events-none text-slate-400 text-sm">
          {prefix}
        </div>
      )}
      {inputElement}
      {suffix && (
        <div className="absolute right-3 flex items-center pointer-events-none text-slate-400 text-xs font-medium uppercase">
          {suffix}
        </div>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
