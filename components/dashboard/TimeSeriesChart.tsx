"use client"

import {CartesianGrid, Line, LineChart, XAxis} from "recharts"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"

const chartConfig = {
    views: {
        label: "Views",
        color: "var(--chart-1)",
    },
    likes: {
        label: "Likes",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

interface TimeSeriesChartProps {
    data: any[]
}

export function TimeSeriesChart({data}: TimeSeriesChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Métricas en el tiempo</CardTitle>
                <CardDescription>Últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("es-ES", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent/>}/>
                        <Line
                            dataKey="views"
                            type="monotone"
                            stroke="var(--color-views)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="likes"
                            type="monotone"
                            stroke="var(--color-likes)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
