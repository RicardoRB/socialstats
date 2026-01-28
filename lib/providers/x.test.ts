import test from 'node:test';
import assert from 'node:assert';
import { x } from './x';
import { getProviders } from '../oauth';

// Mock environment variables for tests
process.env.X_CLIENT_ID = 'test-x-id';
process.env.X_CLIENT_SECRET = 'test-x-secret';

test('X Provider', async (t) => {
  const account = {
    id: 'acc-123',
    access_token: 'test-token',
    refresh_token: 'test-refresh',
    token_expires_at: new Date(Date.now() + 3600000).toISOString(),
  };

  await t.test('fetchMetrics should handle pagination and date ranges', async () => {
    const fromDate = new Date('2023-01-10');
    const toDate = new Date('2023-01-12');

    const originalFetch = global.fetch;
    let callCount = 0;

    global.fetch = (async (url: string) => {
      if (url.includes('/users/me')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: '12345',
              public_metrics: { followers_count: 1000 }
            }
          }),
        };
      }
      if (url.includes('/tweets')) {
        callCount++;
        if (callCount === 1) {
          return {
            ok: true,
            json: async () => ({
              data: [
                {
                  id: 't1',
                  created_at: '2023-01-12T12:00:00Z',
                  public_metrics: { like_count: 10 },
                  organic_metrics: { impression_count: 100 }
                }
              ],
              meta: { next_token: 'page-2' }
            }),
          };
        } else if (callCount === 2) {
          return {
            ok: true,
            json: async () => ({
              data: [
                {
                  id: 't2',
                  created_at: '2023-01-10T12:00:00Z',
                  public_metrics: { like_count: 20 },
                  organic_metrics: { impression_count: 200 }
                }
              ],
              meta: { next_token: 'page-3' }
            }),
          };
        } else {
          // Should stop here because next tweet would be older than fromDate
          return {
            ok: true,
            json: async () => ({
              data: [
                {
                  id: 't3',
                  created_at: '2023-01-01T12:00:00Z',
                  public_metrics: { like_count: 30 },
                  organic_metrics: { impression_count: 300 }
                }
              ],
              meta: {}
            }),
          };
        }
      }
      return { ok: false, text: async () => 'Not Found' };
    }) as any;

    try {
      const metrics = await x.fetchMetrics(account, fromDate, toDate);

      // Verify pagination happened
      assert.strictEqual(callCount, 3); // 1st page, 2nd page, 3rd page (where it stops)

      // Check subscribers (followers)
      const subscribers = metrics.find(m => m.metric_key === 'subscribers');
      assert.ok(subscribers);
      assert.strictEqual(subscribers.value, 1000);

      // Check impressions from page 1 and 2
      const impressions12 = metrics.find(m => m.metric_date === '2023-01-12' && m.metric_key === 'impressions');
      assert.ok(impressions12);
      assert.strictEqual(impressions12.value, 100);

      const impressions10 = metrics.find(m => m.metric_date === '2023-01-10' && m.metric_key === 'impressions');
      assert.ok(impressions10);
      assert.strictEqual(impressions10.value, 200);

      // Verify that t3 (2023-01-01) was NOT included
      const impressions01 = metrics.find(m => m.metric_date === '2023-01-01');
      assert.strictEqual(impressions01, undefined);

    } finally {
      global.fetch = originalFetch;
    }
  });

  await t.test('refreshTokenIfNeeded should use config from getProviders', async () => {
    const expiredAccount = {
      ...account,
      token_expires_at: new Date(Date.now() - 1000).toISOString(),
    };

    const mockSupabase = {
      from: () => ({
        update: () => ({
          eq: () => Promise.resolve({ error: null })
        })
      })
    };

    const originalFetch = global.fetch;
    let requestedUrl = '';

    global.fetch = (async (url: string) => {
      requestedUrl = url;
      return {
        ok: true,
        json: async () => ({
          access_token: 'new-token',
          refresh_token: 'new-refresh',
          expires_in: 7200
        }),
      };
    }) as any;

    try {
      const newToken = await x.refreshTokenIfNeeded!(expiredAccount, mockSupabase);
      const config = getProviders()['x'];
      assert.strictEqual(requestedUrl, config.tokenEndpoint);
      assert.strictEqual(newToken, 'new-token');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
