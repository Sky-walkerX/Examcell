"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return <div className={cn("relative", className)} ref={ref} {...props} />
})
Chart.displayName = "Chart"

const ChartPie = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("relative", className)} ref={ref} {...props} />
  },
)
ChartPie.displayName = "ChartPie"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("flex items-center justify-center text-sm", className)} ref={ref} {...props} />
  },
)
ChartLegend.displayName = "ChartLegend"

const ChartLegendItem = React.forwardRef<
  HTMLDivElement,
  { label: string; color: string } & React.HTMLAttributes<HTMLDivElement>
>(({ className, label, color, ...props }, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="block h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  )
})
ChartLegendItem.displayName = "ChartLegendItem"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("absolute z-10 rounded-md border bg-popover p-4 text-sm shadow-sm", className)}
        ref={ref}
        {...props}
      />
    )
  },
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  { formatValues?: (value: number) => string } & React.HTMLAttributes<HTMLDivElement>
>(({ className, formatValues, children, ...props }, ref) => {
  return (
    <div className={cn("space-y-1", className)} ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && typeof child.props.value === "number") {
          const formattedValue = formatValues ? formatValues(child.props.value) : child.props.value
          return (
            <div className="flex items-center justify-between">
              <span>{child.props.name}</span>
              <span>{formattedValue}</span>
            </div>
          )
        }
        return child
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("relative", className)} ref={ref} {...props} />
  },
)
ChartContainer.displayName = "ChartContainer"

export { Chart, ChartPie, ChartLegend, ChartLegendItem, ChartTooltip, ChartTooltipContent, ChartContainer }
