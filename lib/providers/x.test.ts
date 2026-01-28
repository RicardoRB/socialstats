import test from 'node:test';
import assert from 'node:assert';
import { x } from './x';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.X_CLIENT_ID = 'test-x-client';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

test('X Provider', async (t) => {
  const account = {
    access_token: 'test-token',
    provider_user_id: '12345'
  };
  const fromDate = new Date('2023-10-01T00:00:00Z');
  const toDate = new Date('2023-10-02T00:00:00Z');

  await t.test('getAuthUrl should return a valid URL', () => {
    const url = x.getAuthUrl('user-1', '/dashboard');
    assert.ok(url.includes('https://twitter.com/i/oauth2/authorize'));
    assert.ok(url.includes('client_id=test-x-client'));
    assert.ok(url.includes('code_challenge='));
  });

  await t.test('fetchMetrics should fetch and aggregate metrics correctly', async () => {
    const originalFetch = global.fetch;

    global.fetch = (async (url: string) => {
      if (url.includes('/users/12345?')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              public_metrics: { followers_count: 1500 }
            }
          })
        };
      }
      if (url.includes('/users/12345/tweets?')) {
        // Return 2 tweets on the same day to test aggregation
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                created_at: '2023-10-01T10:00:00Z',
                public_metrics: { like_count: 5, retweet_count: 2 },
                non_public_metrics: { impression_count: 100 }
              },
              {
                created_at: '2023-10-01T15:00:00Z',
                public_metrics: { like_count: 10, reply_count: 3 },
                non_public_metrics: { impression_count: 200 }
              }
            ],
            meta: { next_token: null }
          })
        };
      }
      return { ok: false, text: async () => 'Not Found' };
    }) as any;

    try {
      const metrics = await x.fetchMetrics(account, fromDate, toDate);

      const followers = metrics.find(m => m.metric_key === 'followers');
      assert.strictEqual(followers?.value, 1500);
      assert.strictEqual(followers?.metric_date, '2023-10-02');

      const impressions = metrics.find(m => m.metric_key === 'impressions' && m.metric_date === '2023-10-01');
      assert.strictEqual(impressions?.value, 300); // 100 + 200

      const engagements = metrics.find(m => m.metric_key === 'engagements' && m.metric_date === '2023-10-01');
      assert.strictEqual(engagements?.value, 20); // (5+2) + (10+3)
    } finally {
      global.fetch = originalFetch;
    }
  });

  await t.test('fetchMetrics should handle pagination', async () => {
    const originalFetch = global.fetch;
    let callCount = 0;

    global.fetch = (async (url: string) => {
      if (url.includes('/users/12345?')) {
        return { ok: true, json: async () => ({ data: {} }) };
      }
      if (url.includes('/users/12345/tweets?')) {
        callCount++;
        if (!url.includes('pagination_token=')) {
          return {
            ok: true,
            json: async () => ({
              data: [{ created_at: '2023-10-01T10:00:00Z', public_metrics: { like_count: 1 } }],
              meta: { next_token: 'page-2' }
            })
          };
        } else {
          return {
            ok: true,
            json: async () => ({
              data: [{ created_at: '2023-10-01T11:00:00Z', public_metrics: { like_count: 2 } }],
              meta: { next_token: null }
            })
          };
        }
      }
      return { ok: false };
    }) as any;

    try {
      const metrics = await x.fetchMetrics(account, fromDate, toDate);
      const engagements = metrics.find(m => m.metric_key === 'engagements');
      assert.strictEqual(engagements?.value, 3);
      assert.strictEqual(callCount, 2);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
