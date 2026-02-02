"use client"

import * as React from "react"
import {addDays, isWithinInterval, startOfDay} from "date-fns"
import {DateRange} from "react-day-picker"
import {PlatformLineChart} from "@/components/PlatformLineChart"
import {PlatformMetricsTable} from "@/components/PlatformMetricsTable"
import {DateRangePicker} from "@/components/DateRangePicker"
import {Button} from "@/components/ui/button"
import {ChevronLeftIcon} from "lucide-react"
import Link from "next/link"

interface PlatformClientPageProps {
    provider: string
    account: any
    initialMetrics: any[]
}

export default function PlatformClientPage({
                                               provider,
                                               account,
                                               initialMetrics,
                                           }: PlatformClientPageProps) {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    })

    // Group metrics by date for the chart and table
    const processedData = React.useMemo(() => {
        const dailyData: Record<string, any> = {}

        initialMetrics.forEach((m) => {
            const date = m.metric_date

            // Filter by date range if set
            if (dateRange?.from && dateRange?.to) {
                const mDate = new Date(date)
                if (!isWithinInterval(mDate, {start: startOfDay(dateRange.from), end: startOfDay(dateRange.to)})) {
                    return
                }
            }

            if (!dailyData[date]) {
                dailyData[date] = {date}
            }
            dailyData[date][m.metric_key] = Number(m.value)
        })

        return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
    }, [initialMetrics, dateRange])

    // Get unique metric keys for the table columns
    const availableMetrics = React.useMemo(() => {
        const keys = new Set<string>()
        initialMetrics.forEach(m => keys.add(m.metric_key))
        return Array.from(keys)
    }, [initialMetrics])

    const displayName = account.display_name || provider.charAt(0).toUpperCase() + provider.slice(1)

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ChevronLeftIcon className="h-4 w-4"/>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                        <p className="text-muted-foreground">Detalle de rendimiento y métricas</p>
                    </div>
                </div>
                <DateRangePicker date={dateRange} setDate={setDateRange}/>
            </div>

            <div className="grid gap-8">
                <PlatformLineChart
                    title="Rendimiento en el tiempo"
                    description={`Métricas principales para ${displayName}`}
                    data={processedData}
                    metrics={availableMetrics.filter(m => ['views', 'impressions', 'likes'].includes(m))}
                />

                <PlatformMetricsTable
                    data={processedData}
                    metrics={availableMetrics}
                    provider={provider}
                />
            </div>
        </div>
    )
}
