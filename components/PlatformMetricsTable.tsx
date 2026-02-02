"use client"

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {DownloadIcon} from "lucide-react"
import {convertToCSV, downloadCSV} from "@/lib/csv"

interface PlatformMetricsTableProps {
    data: any[]
    metrics: string[]
    provider: string
}

export function PlatformMetricsTable({data, metrics, provider}: PlatformMetricsTableProps) {
    const handleExport = () => {
        const csv = convertToCSV(data, ['date', ...metrics])
        downloadCSV(csv, `${provider}-metrics-${new Date().toISOString().split('T')[0]}.csv`)
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Métricas Diarias</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <DownloadIcon className="mr-2 h-4 w-4"/>
                    Exportar CSV
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            {metrics.map((metric) => (
                                <TableHead key={metric} className="text-right capitalize">
                                    {metric}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={metrics.length + 1} className="h-24 text-center">
                                    No hay datos para el rango seleccionado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.date}>
                                    <TableCell className="font-medium">
                                        {new Date(row.date).toLocaleDateString("es-ES", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </TableCell>
                                    {metrics.map((metric) => (
                                        <TableCell key={metric} className="text-right">
                                            {row[metric]?.toLocaleString() || 0}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
