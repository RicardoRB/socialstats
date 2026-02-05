import {providers} from './providers';
import {createServerSupabaseClient} from "@/lib/supabase/server";
import {SupabaseClient} from "@supabase/supabase-js";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runSync(
    userId: string,
    providerId: string,
    fromDate: Date,
    toDate: Date,
    supabaseClient?: SupabaseClient,
) {
    const supabase = supabaseClient || createServerSupabaseClient();
    const provider = providers[providerId];

    if (!provider) {
        throw new Error(`Provider ${providerId} not supported`);
    }

    // Ensure provider exists in social_providers table to satisfy foreign key constraints
    await supabase
        .from('social_providers')
        .upsert(
            {id: providerId, display_name: providerId.charAt(0).toUpperCase() + providerId.slice(1)},
            {onConflict: 'id'}
        );

    // 1. Fetch social_accounts for the user and provider
    const {data: accounts, error: accountsError} = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', providerId);

    if (accountsError) {
        console.error('Error fetching social accounts:', accountsError);
        throw accountsError;
    }

    if (!accounts || accounts.length === 0) {
        return [];
    }

    const results = [];

    for (const account of accounts) {
        // 2. Optimistic locking: check if a job is already running for this account
        const {data: existingJob} = await supabase
            .from('sync_jobs')
            .select('id')
            .eq('social_account_id', account.id)
            .eq('status', 'running')
            .is('finished_at', null)
            .maybeSingle();

        if (existingJob) {
            results.push({
                accountId: account.id,
                status: 'skipped',
                reason: 'Sync already in progress',
            });
            continue;
        }

        // 3. Create sync job record
        const {data: job, error: jobError} = await supabase
            .from('sync_jobs')
            .insert({
                social_account_id: account.id,
                provider: providerId,
                status: 'running',
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (jobError) {
            results.push({accountId: account.id, status: 'error', error: jobError.message});
            continue;
        }

        try {
            // Throttling: Add a small delay before processing each account
            await delay(500);

            // 3.5 Refresh token if needed
            if (provider.refreshTokenIfNeeded) {
                const newAccessToken = await provider.refreshTokenIfNeeded(account, supabase);
                account.access_token = newAccessToken;
            }

            // 4. Fetch metrics from the provider
            const metrics = await provider.fetchMetrics(account, fromDate, toDate);

            // 5. Persist metrics in the metrics table
            if (metrics.length > 0) {
                const metricsToInsert = metrics.map((m) => ({
                    ...m,
                    social_account_id: account.id,
                    provider: providerId,
                    user_id: userId,
                }));

                const {error: upsertError} = await supabase
                    .from('metrics')
                    .upsert(metricsToInsert, {
                        onConflict: 'social_account_id,provider,metric_key,metric_date',
                    });

                if (upsertError) throw upsertError;
            }

            // 6. Update job status to completed
            await supabase
                .from('sync_jobs')
                .update({
                    status: 'completed',
                    finished_at: new Date().toISOString(),
                })
                .eq('id', job.id);

            results.push({accountId: account.id, jobId: job.id, status: 'completed'});

            // Update last_synced_at on social_account
            await supabase
                .from('social_accounts')
                .update({last_synced_at: new Date().toISOString()})
                .eq('id', account.id);

        } catch (err: any) {
            console.error(`Sync failed for account ${account.id}:`, err);

            // 7. Update job status to failed
            await supabase
                .from('sync_jobs')
                .update({
                    status: 'failed',
                    last_error: err.message,
                    finished_at: new Date().toISOString(),
                })
                .eq('id', job.id);

            results.push({accountId: account.id, jobId: job.id, status: 'failed', error: err.message});
        }
    }

    return results;
}
