import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-140 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solid Emerald (Brand Primary)
        primary: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800",
        default: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800",
        
        // Emerald Tint (Secondary)
        secondary: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs hover:bg-emerald-100 hover:text-emerald-800",
        
        // White/Slate Border (Outline)
        outline: "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300",
        
        // Ghost (Transparent Hover)
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        
        // Solid Rose (Danger)
        danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800",
        destructive: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800",
        
        // Link
        link: "text-emerald-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
