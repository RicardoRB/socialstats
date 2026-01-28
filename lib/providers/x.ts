import { MetricValue, Provider } from './index';
import { exchangeCode, verifyState, getProviders } from '../oauth';

export async function exchangeCodeAndSave(code: string, state: string, userId: string, supabase: any) {
  const { isValid, redirectTo, codeVerifier } = verifyState(state, userId);
  if (!isValid) {
    throw new Error('Invalid state');
  }

  const tokens = await exchangeCode('x', code, codeVerifier);

  let providerUserId = tokens.provider_user_id;

  // If providerUserId is not in tokens (e.g. OIDC not used or failed), fetch it from /users/me
  if (!providerUserId) {
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      providerUserId = userData.data?.id;
    } else {
      console.error(`Failed to fetch X user ID: ${await userResponse.text()}`);
    }
  }

  if (!providerUserId) {
    throw new Error('Could not determine X provider user ID');
  }

  const { error } = await supabase.from('social_accounts').upsert({
    user_id: userId,
    provider: 'x',
    provider_user_id: providerUserId,
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

export const x: Provider = {
  exchangeCodeAndSave,

  async refreshTokenIfNeeded(account, supabase): Promise<string> {
    const now = new Date();
    const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;

    if (expiresAt && (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000)) {
      return account.access_token;
    }

    if (!account.refresh_token) {
      return account.access_token;
    }

    console.log(`Refreshing X token for account ${account.id}`);
    const config = getProviders()['x'];

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        refresh_token: account.refresh_token,
        grant_type: 'refresh_token',
        client_id: config.clientId,
      }),
    });

    if (response.status === 429) {
      console.warn('X Rate limit hit during token refresh');
      return account.access_token; // Try with existing token if refresh is throttled
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh X token: ${error}`);
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
        refresh_token: data.refresh_token || account.refresh_token,
        token_expires_at: newExpiresAt,
      })
      .eq('id', account.id);

    if (error) throw error;

    return newAccessToken;
  },

  async fetchMetrics(account, fromDate, toDate): Promise<MetricValue[]> {
    console.log(`Fetching X metrics for account ${account.id} from ${fromDate.toISOString()} to ${toDate.toISOString()}`);

    // 1. Get User Info and Followers
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics', {
      headers: { 'Authorization': `Bearer ${account.access_token}` },
    });

    if (userResponse.status === 429) {
      throw new Error('X API Rate Limit hit (User Info)');
    }

    if (!userResponse.ok) {
      const error = await userResponse.text();
      throw new Error(`X API Error (User Info): ${error}`);
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;
    const followersCount = userData.data.public_metrics.followers_count;

    const metrics: MetricValue[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Record followers for "today" (snapshot)
    metrics.push({
      metric_date: today,
      metric_key: 'subscribers',
      value: followersCount,
    });

    // 2. Get Tweets for Impressions and Likes with Pagination
    let nextToken: string | undefined;
    const dailyMetrics: Record<string, { views: number, impressions: number, likes: number }> = {};
    let hasMoreInRange = true;

    do {
      const tweetsUrl = new URL(`https://api.twitter.com/2/users/${userId}/tweets`);
      tweetsUrl.searchParams.set('tweet.fields', 'public_metrics,organic_metrics,created_at');
      tweetsUrl.searchParams.set('max_results', '100');
      if (nextToken) {
        tweetsUrl.searchParams.set('pagination_token', nextToken);
      }

      const tweetsResponse = await fetch(tweetsUrl.toString(), {
        headers: { 'Authorization': `Bearer ${account.access_token}` },
      });

      if (tweetsResponse.status === 429) {
        console.warn('X API Rate Limit hit during tweets fetch, returning partial metrics');
        break;
      }

      if (!tweetsResponse.ok) {
        console.error(`Could not fetch X tweets metrics: ${await tweetsResponse.text()}`);
        break;
      }

      const tweetsData = await tweetsResponse.json();
      if (!tweetsData.data || tweetsData.data.length === 0) break;

      for (const tweet of tweetsData.data) {
        const date = tweet.created_at.split('T')[0];
        const tweetDate = new Date(date);

        if (tweetDate > toDate) continue; // Skip newer than requested
        if (tweetDate < fromDate) {
          hasMoreInRange = false; // We reached older tweets than requested
          break;
        }

        if (!dailyMetrics[date]) {
          dailyMetrics[date] = { views: 0, impressions: 0, likes: 0 };
        }

        const publicMetrics = tweet.public_metrics || {};
        const organicMetrics = tweet.organic_metrics || {};

        const impressions = organicMetrics.impression_count || 0;
        const likes = publicMetrics.like_count || 0;

        dailyMetrics[date].impressions += impressions;
        dailyMetrics[date].views += impressions;
        dailyMetrics[date].likes += likes;
      }

      nextToken = hasMoreInRange ? tweetsData.meta?.next_token : undefined;
    } while (nextToken);

    for (const [date, values] of Object.entries(dailyMetrics)) {
      if (values.impressions > 0) {
        metrics.push({ metric_date: date, metric_key: 'impressions', value: values.impressions });
        metrics.push({ metric_date: date, metric_key: 'views', value: values.views });
      }
      if (values.likes > 0) {
        metrics.push({ metric_date: date, metric_key: 'likes', value: values.likes });
      }
    }

    console.log(`Successfully fetched ${metrics.length} metric points for X account ${account.id}`);
    return metrics;
  }
};
