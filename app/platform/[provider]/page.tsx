import {createServer, requireUser} from "@/lib/auth"
import {notFound} from "next/navigation"
import PlatformClientPage from "./PlatformClientPage"

export default async function PlatformPage({
                                               params,
                                           }: {
    params: Promise<{ provider: string }>
}) {
    const {provider} = await params
    const user = await requireUser()
    const supabase = await createServer()

    // 1. Get the social account for this provider and user
    const {data: account, error: accountError} = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single()

    if (accountError || !account) {
        notFound()
    }

    // 2. Fetch all metrics for this account to start with
    // In a real app, we might want to limit this or fetch based on query params
    const {data: metrics, error: metricsError} = await supabase
        .from('metrics')
        .select('*')
        .eq('social_account_id', account.id)
        .order('metric_date', {ascending: true})

    if (metricsError) {
        console.error('Error fetching metrics:', metricsError)
    }

    return (
        <PlatformClientPage
            provider={provider}
            account={account}
            initialMetrics={metrics || []}
        />
    )
}
