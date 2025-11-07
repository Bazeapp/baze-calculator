"use client"

import * as React from "react"
import { Tooltip as RechartsTooltip } from "recharts"
import type { TooltipContentProps, TooltipProps } from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color?: string
  }
>

type CSSProperties = React.CSSProperties & {
  [key: `--color-${string}`]: string
}

function ChartContainer({
  className,
  children,
  config,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
}) {
  const style = React.useMemo(() => {
    const cssVars = Object.entries(config).reduce((acc, [key, value]) => {
      if (value?.color) {
        acc[`--color-${key}`] = value.color
      }
      return acc
    }, {} as CSSProperties)
    return cssVars
  }, [config])

  return (
    <div
      data-chart
      className={cn("relative", className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}

function ChartTooltip({
  className,
  ...props
}: TooltipProps<number, string> & {
  className?: string
}) {
  return (
    <RechartsTooltip
      wrapperClassName={cn("outline-none", className)}
      contentStyle={{
        borderRadius: "0.75rem",
        borderColor: "hsl(var(--border))",
        backgroundColor: "hsl(var(--background))",
      }}
      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
      {...props}
    />
  )
}

type ChartTooltipContentProps = TooltipProps<number, string> &
  Partial<
    Pick<TooltipContentProps<number, string>, "active" | "payload" | "label">
  > & {
    hideLabel?: boolean
  }

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]
  const displayLabel = item.name ?? label

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      {!hideLabel && (
        <p className="text-muted-foreground">{displayLabel as string}</p>
      )}
      <p className="font-semibold text-foreground">
        {typeof item.value === "number"
          ? item.value.toLocaleString("it-IT", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            })
          : item.value}
      </p>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
