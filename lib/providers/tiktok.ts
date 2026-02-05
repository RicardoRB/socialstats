import {MetricValue, Provider} from './index';
import {exchangeCode, getProviders, verifyState} from '../oauth';

export async function exchangeCodeAndSave(code: string, state: string, userId: string, supabase: any) {
    const {isValid, redirectTo} = verifyState(state, userId);
    if (!isValid) {
        throw new Error('Invalid state');
    }

    // 1. Exchange code for access token
    const tokens = await exchangeCode('tiktok', code);

    // 2. Get User Info to get provider_user_id and profile details
    const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url_100', {
        headers: {
            'Authorization': `Bearer ${tokens.access_token}`
        }
    });

    if (!userInfoResponse.ok) {
        const err = await userInfoResponse.text();
        throw new Error(`Failed to fetch TikTok user info: ${err}`);
    }

    const userInfo = await userInfoResponse.json();
    if (!userInfo.data || !userInfo.data.user) {
        throw new Error('Invalid response from TikTok User Info API');
    }

    const {open_id, display_name, avatar_url_100} = userInfo.data.user;

    const {error} = await supabase.from('social_accounts').upsert({
        user_id: userId,
        provider: 'tiktok',
        provider_user_id: open_id,
        display_name: display_name,
        avatar_url: avatar_url_100,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
    }, {
        onConflict: 'user_id,provider,provider_user_id'
    });

    if (error) throw error;

    return {redirectTo};
}

export const tiktok: Provider = {
    exchangeCodeAndSave,

    async refreshTokenIfNeeded(account, supabase): Promise<string> {
        const now = new Date();
        const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;

        // Refresh if expired or expiring in the next 5 minutes
        if (expiresAt && (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000)) {
            return account.access_token;
        }

        if (!account.refresh_token) {
            return account.access_token;
        }

        const config = getProviders()['tiktok'];
        const response = await fetch(config.tokenEndpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                client_key: config.clientId,
                client_secret: config.clientSecret,
                refresh_token: account.refresh_token,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to refresh TikTok token: ${error}`);
        }

        const data = await response.json();
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token; // TikTok might provide a new refresh token
        const newExpiresAt = data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : null;

        const updateData: any = {
            access_token: newAccessToken,
            token_expires_at: newExpiresAt,
        };
        if (newRefreshToken) {
            updateData.refresh_token = newRefreshToken;
        }

        const {error} = await supabase
            .from('social_accounts')
            .update(updateData)
            .eq('id', account.id);

        if (error) throw error;

        return newAccessToken;
    },

    async fetchMetrics(account, fromDate, toDate): Promise<MetricValue[]> {
        const metrics: MetricValue[] = [];

        // Fetch current stats from user info
        const response = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count', {
            headers: {
                'Authorization': `Bearer ${account.access_token}`
            }
        });

        if (!response.ok) {
            console.error(`TikTok API error: ${await response.text()}`);
            return [];
        }

        const json = await response.json();
        if (json.data && json.data.user) {
            const date = new Date().toISOString().split('T')[0];
            const user = json.data.user;

            if (user.follower_count !== undefined) {
                metrics.push({
                    metric_date: date,
                    metric_key: 'subscribers',
                    value: user.follower_count
                });
            }

            if (user.likes_count !== undefined) {
                metrics.push({
                    metric_date: date,
                    metric_key: 'likes',
                    value: user.likes_count
                });
            }
        }

        return metrics;
    }
};
