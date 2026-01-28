import { MetricValue, Provider } from './index';
import { buildAuthUrl, exchangeCode, verifyState } from '../oauth';

export const getAuthUrl = (userId: string, redirectTo?: string) => {
  return buildAuthUrl('youtube', userId, redirectTo);
};

export async function exchangeCodeAndSave(code: string, state: string, userId: string, supabase: any) {
  const { isValid, redirectTo } = verifyState(state, userId);
  if (!isValid) {
    throw new Error('Invalid state');
  }

  const tokens = await exchangeCode('youtube', code);

  const { error } = await supabase.from('social_accounts').upsert({
    user_id: userId,
    provider: 'youtube',
    provider_user_id: tokens.provider_user_id || 'unknown',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null,
  }, {
    onConflict: 'user_id,provider,provider_user_id'
  });

  if (error) throw error;

  return { redirectTo };
}

export const youtube: Provider = {
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

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: account.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const newExpiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from('social_accounts')
      .update({
        access_token: newAccessToken,
        token_expires_at: newExpiresAt,
      })
      .eq('id', account.id);

    if (error) throw error;

    return newAccessToken;
  },

  async fetchMetrics(account, fromDate, toDate): Promise<MetricValue[]> {
    const startDate = fromDate.toISOString().split('T')[0];
    const endDate = toDate.toISOString().split('T')[0];

    const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports');
    url.searchParams.set('ids', 'channel==MINE');
    url.searchParams.set('startDate', startDate);
    url.searchParams.set('endDate', endDate);
    url.searchParams.set('metrics', 'views,likes,subscribersGained,impressions');
    url.searchParams.set('dimensions', 'day');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YouTube Analytics API error: ${error}`);
    }

    const data = await response.json();
    const metrics: MetricValue[] = [];

    if (!data.rows || data.rows.length === 0) return [];

    const dateIdx = data.columnHeaders.findIndex((h: any) => h.name === 'day');
    const viewsIdx = data.columnHeaders.findIndex((h: any) => h.name === 'views');
    const likesIdx = data.columnHeaders.findIndex((h: any) => h.name === 'likes');
    const subsIdx = data.columnHeaders.findIndex((h: any) => h.name === 'subscribersGained');
    const impressionsIdx = data.columnHeaders.findIndex((h: any) => h.name === 'impressions');

    for (const row of data.rows) {
      const date = row[dateIdx];

      if (viewsIdx !== -1) {
        metrics.push({ metric_date: date, metric_key: 'views', value: Number(row[viewsIdx]) });
      }
      if (likesIdx !== -1) {
        metrics.push({ metric_date: date, metric_key: 'likes', value: Number(row[likesIdx]) });
      }
      if (subsIdx !== -1) {
        metrics.push({ metric_date: date, metric_key: 'subscribers', value: Number(row[subsIdx]) });
      }
      if (impressionsIdx !== -1) {
        metrics.push({ metric_date: date, metric_key: 'impressions', value: Number(row[impressionsIdx]) });
      }
    }

    return metrics;
  }
};
