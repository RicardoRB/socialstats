import test from 'node:test';
import assert from 'node:assert';
import { transformMetricsData } from './route';

test('Metrics Overview Logic', async (t) => {
  await t.test('transformMetricsData should correctly aggregate data', () => {
    const input = [
      { metric_key: 'views', provider: 'youtube', sum: '5000' },
      { metric_key: 'views', provider: 'x', sum: '7000' },
      { metric_key: 'likes', provider: 'youtube', sum: '100' },
      { metric_key: 'impressions', provider: 'x', sum: '20000' }
    ];

    const expected = {
      totals: {
        views: 12000,
        likes: 100,
        impressions: 20000
      },
      byProvider: {
        youtube: {
          views: 5000,
          likes: 100
        },
        x: {
          views: 7000,
          impressions: 20000
        }
      }
    };

    const result = transformMetricsData(input);
    assert.deepStrictEqual(result, expected);
  });

  await t.test('transformMetricsData should handle empty data', () => {
    const input: any[] = [];
    const expected = {
      totals: {},
      byProvider: {}
    };

    const result = transformMetricsData(input);
    assert.deepStrictEqual(result, expected);
  });

  await t.test('transformMetricsData should handle null/missing sum as 0', () => {
    const input = [
      { metric_key: 'views', provider: 'youtube', sum: null },
      { metric_key: 'likes', provider: 'youtube' }
    ];

    const expected = {
      totals: {
        views: 0,
        likes: 0
      },
      byProvider: {
        youtube: {
          views: 0,
          likes: 0
        }
      }
    };

    const result = transformMetricsData(input);
    assert.deepStrictEqual(result, expected);
  });
});
