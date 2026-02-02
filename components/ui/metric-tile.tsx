import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricTileProps extends React.ComponentProps<typeof Card> {
  label: string
  value: string | number
  trend?: number
  icon?: React.ReactNode
}

function MetricTile({
  label,
  value,
  trend,
  icon,
  className,
  ...props
}: MetricTileProps) {
  const isPositive = trend !== undefined && trend > 0
  const isNegative = trend !== undefined && trend < 0

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs",
              isPositive
                ? "text-emerald-500"
                : isNegative
                  ? "text-rose-500"
                  : "text-muted-foreground"
            )}
          >
            {isPositive ? (
              <ArrowUpIcon className="size-3" />
            ) : isNegative ? (
              <ArrowDownIcon className="size-3" />
            ) : null}
            {Math.abs(trend)}% vs last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { MetricTile }
