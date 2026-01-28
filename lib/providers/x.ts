import { MetricValue, Provider } from './index';
import { buildAuthUrl, exchangeCode, verifyState } from '@/lib/oauth';
import { createServer } from '@/lib/auth';

function updateMetric(metrics: MetricValue[], date: string, key: string, value: number) {
  const existing = metrics.find((m) => m.metric_date === date && m.metric_key === key);
  if (existing) {
    existing.value += value;
  } else {
    metrics.push({ metric_date: date, metric_key: key, value });
  }
}

export const x: Provider & {
  getAuthUrl: (userId: string, redirectTo?: string) => string;
  exchangeCodeAndSave: (userId: string, code: string, state: string) => Promise<any>;
} = {
  getAuthUrl(userId: string, redirectTo?: string) {
    const { url } = buildAuthUrl('x', userId, redirectTo);
    return url;
  },

  async exchangeCodeAndSave(userId: string, code: string, state: string) {
    const { isValid, codeVerifier } = verifyState(state, userId);
    if (!isValid) throw new Error('Invalid state');

    const tokens = await exchangeCode('x', code, codeVerifier);

    // Get user info to get provider_user_id
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Failed to fetch Twitter user info: ${errorText}`);
    }

    const userData = await userResponse.json();
    const providerUserId = userData.data.id;
    const displayName = userData.data.username;

    const supabase = await createServer();
    const { error } = await supabase
      .from('social_accounts')
      .upsert(
        {
          user_id: userId,
          provider: 'x',
          provider_user_id: providerUserId,
          display_name: displayName,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,provider,provider_user_id',
        }
      );

    if (error) throw error;
    return { success: true, provider_user_id: providerUserId };
  },

  async fetchMetrics(account, fromDate, toDate): Promise<MetricValue[]> {
    const metrics: MetricValue[] = [];
    const accessToken = account.access_token;
    const twitterId = account.provider_user_id;

    // 1. Fetch User Metrics (Followers)
    try {
      const userRes = await fetch(
        `https://api.twitter.com/2/users/${twitterId}?user.fields=public_metrics`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (userRes.ok) {
        const userData = await userRes.ok ? await userRes.json() : null;
        if (userData?.data) {
          const followersCount = userData.data.public_metrics?.followers_count || 0;

          // Followers is a snapshot, record it for the end date
          metrics.push({
            metric_date: toDate.toISOString().split('T')[0],
            metric_key: 'followers',
            value: followersCount,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching Twitter user metrics:', error);
    }

    // 2. Fetch Tweets for the period
    const startTime = fromDate.toISOString();
    const endTime = toDate.toISOString();

    let nextToken: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      let url = `https://api.twitter.com/2/users/${twitterId}/tweets?start_time=${startTime}&end_time=${endTime}&tweet.fields=public_metrics,non_public_metrics,created_at&max_results=100`;
      if (nextToken) {
        url += `&pagination_token=${nextToken}`;
      }

      try {
        const tweetsRes = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (tweetsRes.status === 429) {
          console.warn('Twitter API rate limit reached');
          break;
        }

        if (!tweetsRes.ok) {
          console.error('Error fetching Twitter tweets:', await tweetsRes.text());
          break;
        }

        const tweetsData = await tweetsRes.json();
        if (!tweetsData.data || tweetsData.data.length === 0) break;

        for (const tweet of tweetsData.data) {
          const dateStr = tweet.created_at.split('T')[0];
          const publicMetrics = tweet.public_metrics || {};
          const nonPublicMetrics = tweet.non_public_metrics || {};

          const impressions = nonPublicMetrics.impression_count || publicMetrics.impression_count || 0;
          const engagements =
            (publicMetrics.retweet_count || 0) +
            (publicMetrics.reply_count || 0) +
            (publicMetrics.like_count || 0) +
            (publicMetrics.quote_count || 0);

          updateMetric(metrics, dateStr, 'impressions', impressions);
          updateMetric(metrics, dateStr, 'engagements', engagements);
        }

        nextToken = tweetsData.meta?.next_token;
        hasMore = !!nextToken;
      } catch (error) {
        console.error('Error in Twitter fetch loop:', error);
        break;
      }
    }

    return metrics;
  },
};
