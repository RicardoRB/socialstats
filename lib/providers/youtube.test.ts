import test from 'node:test';
import assert from 'node:assert';
import { youtube } from './youtube';

// Mock global fetch
const originalFetch = global.fetch;

test('YouTube Provider', async (t) => {
  await t.test('fetchMetrics should map YouTube Analytics API response correctly', async () => {
    const mockResponse = {
      columnHeaders: [
        { name: 'day' },
        { name: 'views' },
        { name: 'likes' },
        { name: 'subscribersGained' },
        { name: 'impressions' }
      ],
      rows: [
        ['2023-01-01', '100', '5', '1', '1000'],
        ['2023-01-02', '150', '8', '2', '1200']
      ]
    };

    global.fetch = (async (url: string) => {
      return {
        ok: true,
        json: async () => mockResponse,
      };
    }) as any;

    const account = { access_token: 'fake-token' };
    const fromDate = new Date('2023-01-01');
    const toDate = new Date('2023-01-02');

    const metrics = await youtube.fetchMetrics(account, fromDate, toDate);

    assert.strictEqual(metrics.length, 8); // 4 metrics * 2 days

    const viewsJan1 = metrics.find(m => m.metric_date === '2023-01-01' && m.metric_key === 'views');
    assert.strictEqual(viewsJan1?.value, 100);

    const subsJan2 = metrics.find(m => m.metric_date === '2023-01-02' && m.metric_key === 'subscribers');
    assert.strictEqual(subsJan2?.value, 2);

    const impressionsJan1 = metrics.find(m => m.metric_date === '2023-01-01' && m.metric_key === 'impressions');
    assert.strictEqual(impressionsJan1?.value, 1000);

    global.fetch = originalFetch;
  });

  await t.test('refreshTokenIfNeeded should refresh token when expired', async () => {
    let updateCalled = false;
    const mockSupabase = {
      from: () => ({
        update: () => ({
          eq: () => {
            updateCalled = true;
            return Promise.resolve({ error: null });
          }
        })
      })
    };

    const mockTokenResponse = {
      access_token: 'new-access-token',
      expires_in: 3600
    };

    global.fetch = (async () => ({
      ok: true,
      json: async () => mockTokenResponse
    })) as any;

    const account = {
      id: 'acc-1',
      refresh_token: 'fake-refresh-token',
      token_expires_at: new Date(Date.now() - 10000).toISOString() // Expired
    };

    const newToken = await youtube.refreshTokenIfNeeded!(account, mockSupabase);

    assert.strictEqual(newToken, 'new-access-token');
    assert.strictEqual(updateCalled, true);

    global.fetch = originalFetch;
  });

  await t.test('refreshTokenIfNeeded should NOT refresh if not expired', async () => {
    const mockSupabase = {};
    const account = {
      access_token: 'current-token',
      token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString() // Valid
    };

    const newToken = await youtube.refreshTokenIfNeeded!(account, mockSupabase);
    assert.strictEqual(newToken, 'current-token');
  });
});
