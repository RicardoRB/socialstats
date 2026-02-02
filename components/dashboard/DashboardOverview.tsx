import {MetricTile} from "./MetricTile"
import {Eye, ThumbsUp, Users, Zap} from "lucide-react"

interface DashboardOverviewProps {
    metrics: {
        views?: number
        likes?: number
        subscribers?: number
        engagements?: number
        impressions?: number
    }
}

export function DashboardOverview({metrics}: DashboardOverviewProps) {
    const formatNumber = (num: number = 0) => {
        return new Intl.NumberFormat('es-ES', {notation: 'compact'}).format(num)
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricTile
                title="Visualizaciones Totales"
                value={formatNumber(metrics.views || metrics.impressions)}
                icon={<Eye className="h-4 w-4"/>}
                description="En todos los canales"
            />
            <MetricTile
                title="Me gusta"
                value={formatNumber(metrics.likes)}
                icon={<ThumbsUp className="h-4 w-4"/>}
            />
            <MetricTile
                title="Seguidores / Subs"
                value={formatNumber(metrics.subscribers)}
                icon={<Users className="h-4 w-4"/>}
            />
            <MetricTile
                title="Engagement"
                value={formatNumber(metrics.engagements)}
                icon={<Zap className="h-4 w-4"/>}
            />
        </div>
    )
}
