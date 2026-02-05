import {NextResponse} from 'next/server';
import {runSync} from '@/lib/syncRunner';
import {getSession} from "@/lib/supabase/server";

export async function POST(
    req: Request,
    {params}: { params: Promise<{ provider: string }> }
) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {provider} = await params;

    let body: any = {};
    try {
        body = await req.json();
    } catch (e) {
        // Body is optional
    }

    const {fromDate, toDate} = body;

    // Default range: last 7 days
    const start = fromDate ? new Date(fromDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = toDate ? new Date(toDate) : new Date();

    try {
        const results = await runSync(session.user.id, provider, start, end);

        if (results.length === 0) {
            return NextResponse.json({message: 'No accounts found for provider'}, {status: 404});
        }

        // Return the first one to match the contract {jobId, status}
        // and include all results in a separate field.
        const primaryResult = results[0];

        return NextResponse.json({
            jobId: primaryResult.jobId,
            status: primaryResult.status,
            results
        });
    } catch (error: any) {
        console.error('Sync endpoint error:', error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}
