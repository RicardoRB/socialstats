import test from 'node:test';
import assert from 'node:assert';
import { runSync } from './syncRunner';

// Helper to mock Supabase chain
const createMockSupabase = (overrides: any = {}) => {
  const mock: any = {
    from: (table: string) => {
      const chain: any = {
        upsert: () => Promise.resolve({ error: null }),
        select: () => chain,
        insert: () => chain,
        update: () => chain,
        eq: () => chain,
        is: () => chain,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
      };

      if (overrides[table]) {
        Object.assign(chain, overrides[table]);
      } else if (table === 'social_accounts') {
        // Mock returning one account
        chain.eq = () => ({
           eq: () => Promise.resolve({ data: [{ id: 'acc-1' }], error: null })
        });
      }

      return chain;
    }
  };
  return mock;
};

const originalFetch = global.fetch;

test('Sync Runner Logic', async (t) => {
  await t.test('runSync should complete successfully when everything is fine', async () => {
    global.fetch = (async () => ({
      ok: true,
      json: async () => ({
        columnHeaders: [{ name: 'day' }, { name: 'views' }],
        rows: [['2023-01-01', '100']]
      })
    })) as any;

    let upsertCalled = false;
    const mockSupabase = createMockSupabase({
      metrics: {
        upsert: () => {
          upsertCalled = true;
          return Promise.resolve({ error: null });
        }
      }
    });

    const results = await runSync('user-1', 'youtube', new Date(), new Date(), mockSupabase);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].status, 'completed');
    assert.strictEqual(upsertCalled, true);

    global.fetch = originalFetch;
  });

  await t.test('runSync should skip if already running', async () => {
    const mockSupabase = createMockSupabase({
      sync_jobs: {
        select: () => ({
          eq: () => ({
            eq: () => ({
              is: () => ({
                maybeSingle: () => Promise.resolve({ data: { id: 'existing' }, error: null })
              })
            })
          })
        })
      }
    });

    const results = await runSync('user-1', 'youtube', new Date(), new Date(), mockSupabase);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].status, 'skipped');
    assert.strictEqual(results[0].reason, 'Sync already in progress');
  });

  await t.test('runSync should handle errors and update job status', async () => {
    global.fetch = (async () => ({
      ok: true,
      json: async () => ({
        columnHeaders: [{ name: 'day' }, { name: 'views' }],
        rows: [['2023-01-01', '100']]
      })
    })) as any;

    const mockSupabase = createMockSupabase({
      metrics: {
        upsert: () => Promise.resolve({ error: new Error('Database Error') })
      }
    });
    // In our implementation, if upsertError exists, it throws it.

    // We also need to mock the update call for the job
    let failureRecorded = false;
    const originalFrom = mockSupabase.from;
    mockSupabase.from = (table: string) => {
      const chain = originalFrom(table);
      if (table === 'sync_jobs') {
        const originalUpdate = chain.update;
        chain.update = (data: any) => {
          if (data.status === 'failed') failureRecorded = true;
          return originalUpdate(data);
        };
      }
      return chain;
    };

    const results = await runSync('user-1', 'youtube', new Date(), new Date(), mockSupabase);
    assert.strictEqual(results[0].status, 'failed');
    assert.strictEqual(failureRecorded, true);

    global.fetch = originalFetch;
  });
});
