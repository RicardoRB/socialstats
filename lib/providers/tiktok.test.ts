import test from 'node:test';
import assert from 'node:assert';
import {tiktok} from './tiktok';

// Mock global fetch
const originalFetch = global.fetch;

test('TikTok Provider', async (t) => {
    await t.test('fetchMetrics should map TikTok User Info API response correctly', async () => {
        const mockResponse = {
            data: {
                user: {
                    follower_count: 5000,
                    likes_count: 10000
                }
            }
        };

        global.fetch = (async (url: string) => {
            return {
                ok: true,
                json: async () => mockResponse,
            };
        }) as any;

        const account = {access_token: 'fake-token'};
        const fromDate = new Date('2023-01-01');
        const toDate = new Date('2023-01-02');

        const metrics = await tiktok.fetchMetrics(account, fromDate, toDate);

        assert.strictEqual(metrics.length, 2);

        const subs = metrics.find(m => m.metric_key === 'subscribers');
        assert.strictEqual(subs?.value, 5000);

        const likes = metrics.find(m => m.metric_key === 'likes');
        assert.strictEqual(likes?.value, 10000);

        global.fetch = originalFetch;
    });

    await t.test('refreshTokenIfNeeded should refresh token when expired', async () => {
        let updateCalled = false;
        const mockSupabase = {
            from: () => ({
                update: () => ({
                    eq: () => {
                        updateCalled = true;
                        return Promise.resolve({error: null});
                    }
                })
            })
        };

        const mockTokenResponse = {
            access_token: 'new-tiktok-access-token',
            refresh_token: 'new-tiktok-refresh-token',
            expires_in: 3600
        };

        global.fetch = (async () => ({
            ok: true,
            json: async () => mockTokenResponse
        })) as any;

        const account = {
            id: 'acc-tiktok-1',
            refresh_token: 'old-refresh-token',
            token_expires_at: new Date(Date.now() - 10000).toISOString() // Expired
        };

        const newToken = await tiktok.refreshTokenIfNeeded!(account, mockSupabase);

        assert.strictEqual(newToken, 'new-tiktok-access-token');
        assert.strictEqual(updateCalled, true);

        global.fetch = originalFetch;
    });
});
