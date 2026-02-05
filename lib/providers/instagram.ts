import {MetricValue, Provider} from './index';
import {exchangeCode, getProviders, verifyState} from '../oauth';

export async function exchangeCodeAndSave(code: string, state: string, userId: string, supabase: any) {
    const {isValid, redirectTo} = verifyState(state, userId);
    if (!isValid) {
        throw new Error('Invalid state');
    }

    const config = getProviders()['instagram'];

    // 1. Exchange code for access token (short-lived)
    const tokens = await exchangeCode('instagram', code);

    // 2. Exchange for long-lived token
    const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longLivedUrl.searchParams.set('client_id', config.clientId);
    longLivedUrl.searchParams.set('client_secret', config.clientSecret);
    longLivedUrl.searchParams.set('fb_exchange_token', tokens.access_token);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    if (!longLivedResponse.ok) {
        const err = await longLivedResponse.text();
        throw new Error(`Failed to exchange for long-lived token: ${err}`);
    }
    const longLivedData = await longLivedResponse.json();
    const accessToken = longLivedData.access_token;
    const expiresAt = longLivedData.expires_in
        ? new Date(Date.now() + longLivedData.expires_in * 1000).toISOString()
        : null;

    // 3. Get Instagram Business Account
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
    if (!pagesResponse.ok) {
        const err = await pagesResponse.text();
        throw new Error(`Failed to fetch pages: ${err}`);
    }
    const pagesData = await pagesResponse.json();

    let igAccountId = null;
    let igUsername = null;
    let igProfilePic = null;

    for (const page of pagesData.data || []) {
        const igResponse = await fetch(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`);
        if (igResponse.ok) {
            const igData = await igResponse.json();
            if (igData.instagram_business_account) {
                igAccountId = igData.instagram_business_account.id;
                igUsername = igData.instagram_business_account.username;
                igProfilePic = igData.instagram_business_account.profile_picture_url;
                break;
            }
        }
    }

    if (!igAccountId) {
        throw new Error('No Instagram Business Account found linked to your Facebook Pages. Please ensure you have a Business or Creator account connected to a Facebook Page.');
    }

    const {error} = await supabase.from('social_accounts').upsert({
        user_id: userId,
        provider: 'instagram',
        provider_user_id: igAccountId,
        display_name: igUsername,
        avatar_url: igProfilePic,
        access_token: accessToken,
        token_expires_at: expiresAt,
    }, {
        onConflict: 'user_id,provider,provider_user_id'
    });

    if (error) throw error;

    return {redirectTo};
}

export const instagram: Provider = {
    exchangeCodeAndSave,

    async fetchMetrics(account, fromDate, toDate): Promise<MetricValue[]> {
        const metrics: MetricValue[] = [];

        // 1. Get Total Followers (Snapshot for today)
        const infoResponse = await fetch(`https://graph.facebook.com/v18.0/${account.provider_user_id}?fields=followers_count&access_token=${account.access_token}`);
        if (infoResponse.ok) {
            const infoData = await infoResponse.json();
            metrics.push({
                metric_date: new Date().toISOString().split('T')[0],
                metric_key: 'subscribers',
                value: infoData.followers_count
            });
        }

        // 2. Get Insights
        const since = Math.floor(fromDate.getTime() / 1000);
        const until = Math.floor(toDate.getTime() / 1000);

        const insightsUrl = new URL(`https://graph.facebook.com/v18.0/${account.provider_user_id}/insights`);
        insightsUrl.searchParams.set('metric', 'impressions,reach,profile_views');
        insightsUrl.searchParams.set('period', 'day');
        insightsUrl.searchParams.set('since', since.toString());
        insightsUrl.searchParams.set('until', until.toString());
        insightsUrl.searchParams.set('access_token', account.access_token);

        const insightsResponse = await fetch(insightsUrl.toString());
        if (!insightsResponse.ok) {
            console.error(`Instagram Insights Error: ${await insightsResponse.text()}`);
            return metrics; // Return what we have (followers)
        }

        const insightsData = await insightsResponse.json();
        for (const metric of insightsData.data || []) {
            for (const val of metric.values) {
                // Instagram end_time is the end of the day, so for 2023-01-01 the end_time is 2023-01-02T00:00:00+0000
                // We subtract one second to get the correct date label
                const dateObj = new Date(val.end_time);
                dateObj.setSeconds(dateObj.getSeconds() - 1);
                const date = dateObj.toISOString().split('T')[0];

                let key = '';
                if (metric.name === 'impressions') key = 'impressions';
                else if (metric.name === 'reach') key = 'views';
                else if (metric.name === 'profile_views') key = 'engagements';

                if (key) {
                    metrics.push({
                        metric_date: date,
                        metric_key: key,
                        value: val.value
                    });
                }
            }
        }

        return metrics;
    }
};
