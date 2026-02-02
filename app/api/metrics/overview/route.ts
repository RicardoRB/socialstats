import {createClient} from '@/lib/supabase-server';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
        return NextResponse.json({error: 'Missing from or to date'}, {status: 400});
    }

    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    // Query metrics grouped by date, metric_key and provider
    // PostgREST automatically groups by non-aggregate columns when an aggregate is used
    const {data, error} = await supabase
        .from('metrics')
        .select('metric_date, metric_key, provider, sum:value.sum()')
        .eq('user_id', user.id)
        .gte('metric_date', from)
        .lte('metric_date', to)
        .order('metric_date', {ascending: true});

    if (error) {
        console.error('Error fetching metrics overview:', error);
        return NextResponse.json({error: error.message}, {status: 500});
    }

    const result = transformMetricsData(data || []);

    return NextResponse.json(
        result,
        {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            },
        }
    );
}

interface MetricRow {
    metric_date: string;
    metric_key: string;
    provider: string;
    sum: string | number | null;
}

export function transformMetricsData(data: MetricRow[]) {
    const totals: Record<string, number> = {};
    const byProvider: Record<string, Record<string, number>> = {};
    const timeSeriesMap: Record<string, Record<string, number>> = {};

    data.forEach((row) => {
        const {metric_date, metric_key, provider, sum} = row;
        const val = Number(sum || 0);

        // Update totals
        totals[metric_key] = (totals[metric_key] || 0) + val;

        // Update byProvider
        if (!byProvider[provider]) {
            byProvider[provider] = {};
        }
        byProvider[provider][metric_key] = (byProvider[provider][metric_key] || 0) + val;

        // Update timeSeriesMap
        if (!timeSeriesMap[metric_date]) {
            timeSeriesMap[metric_date] = {date: metric_date} as any;
        }
        timeSeriesMap[metric_date][metric_key] = (timeSeriesMap[metric_date][metric_key] || 0) + val;
    });

    const timeSeries = Object.values(timeSeriesMap).sort((a: any, b: any) =>
        a.date.localeCompare(b.date)
    );

    return {totals, byProvider, timeSeries};
}
