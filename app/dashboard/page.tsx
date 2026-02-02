import {requireUser} from '@/lib/auth'
import {createClient} from '@/lib/supabase-server'
import {transformMetricsData} from '@/app/api/metrics/overview/route'
import {DashboardOverview} from '@/components/dashboard/DashboardOverview'
import {TimeSeriesChart} from '@/components/dashboard/TimeSeriesChart'
import {PlatformList} from '@/components/dashboard/PlatformList'
import LogoutButton from './LogoutButton'
import {Toaster} from '@/components/ui/sonner'

export default async function DashboardPage() {
    const user = await requireUser()
    const supabase = await createClient()

    // Fetch social accounts
    const {data: accounts} = await supabase
        .from('social_accounts')
        .select('id, provider, display_name, avatar_url, last_synced_at')
        .eq('user_id', user.id)
        .order('connected_at', {ascending: false})

    // Fetch metrics for the last 30 days
    const to = new Date().toISOString().split('T')[0]
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const {data: metricsData} = await supabase
        .from('metrics')
        .select('metric_date, metric_key, provider, sum:value.sum()')
        .eq('user_id', user.id)
        .gte('metric_date', from)
        .lte('metric_date', to)
        .order('metric_date', {ascending: true})

    const {totals, timeSeries} = transformMetricsData(metricsData || [])

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Bienvenido de nuevo, {user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                    <LogoutButton/>
                </div>
            </header>

            <DashboardOverview metrics={totals}/>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <TimeSeriesChart data={timeSeries}/>
                </div>
                <div className="lg:col-span-1">
                    <PlatformList accounts={accounts || []}/>
                </div>
            </div>

            <Toaster/>
        </div>
    )
}
