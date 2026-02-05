import { describe, it } from 'node:test';
import assert from 'node:assert';
import { instagram } from './instagram';

describe('Instagram Provider', () => {
    it('fetchMetrics should fetch and map Instagram insights correctly', async (t) => {
        // Mock global fetch
        const originalFetch = global.fetch;
        global.fetch = async (url: any) => {
            if (url.toString().includes('followers_count')) {
                return {
                    ok: true,
                    json: async () => ({ followers_count: 5000 })
                } as any;
            }
            if (url.toString().includes('insights')) {
                return {
                    ok: true,
                    json: async () => ({
                        data: [
                            {
                                name: 'impressions',
                                values: [{ end_time: '2023-01-02T00:00:00+0000', value: 100 }]
                            },
                            {
                                name: 'reach',
                                values: [{ end_time: '2023-01-02T00:00:00+0000', value: 80 }]
                            },
                            {
                                name: 'profile_views',
                                values: [{ end_time: '2023-01-02T00:00:00+0000', value: 10 }]
                            }
                        ]
                    })
                } as any;
            }
            return { ok: false } as any;
        };

        try {
            const account = { provider_user_id: 'ig-123', access_token: 'token' };
            const fromDate = new Date('2023-01-01');
            const toDate = new Date('2023-01-02');

            const metrics = await instagram.fetchMetrics(account, fromDate, toDate);

            // Check followers (it uses current date, so we check existence and value)
            const subscribers = metrics.find(m => m.metric_key === 'subscribers');
            assert.ok(subscribers);
            assert.strictEqual(subscribers.value, 5000);

            // Check insights
            const impressions = metrics.find(m => m.metric_key === 'impressions' && m.metric_date === '2023-01-01');
            assert.ok(impressions);
            assert.strictEqual(impressions.value, 100);

            const views = metrics.find(m => m.metric_key === 'views' && m.metric_date === '2023-01-01');
            assert.ok(views);
            assert.strictEqual(views.value, 80);

            const engagements = metrics.find(m => m.metric_key === 'engagements' && m.metric_date === '2023-01-01');
            assert.ok(engagements);
            assert.strictEqual(engagements.value, 10);

        } finally {
            global.fetch = originalFetch;
        }
    });
});
