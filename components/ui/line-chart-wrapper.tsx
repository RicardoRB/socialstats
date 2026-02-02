"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface LineChartWrapperProps extends React.ComponentProps<"div"> {
  data: Record<string, string | number>[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
}

function LineChartWrapper({
  data,
  index,
  categories,
  colors = ["#2563eb", "#dc2626", "#16a34a", "#ca8a04"],
  valueFormatter = (value: number) => value.toLocaleString(),
  className,
  ...props
}: LineChartWrapperProps) {
  const config = React.useMemo(() => {
    const cfg: ChartConfig = {}
    categories.forEach((cat, i) => {
      cfg[cat] = {
        label: cat,
        color: colors[i % colors.length],
      }
    })
    return cfg
  }, [categories, colors])

  return (
    <ChartContainer config={config} className={className} {...props}>
      <LineChart
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey={index}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={valueFormatter}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {categories.map((cat) => (
          <Line
            key={cat}
            dataKey={cat}
            type="monotone"
            stroke={`var(--color-${cat})`}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
            }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

export { LineChartWrapper }
