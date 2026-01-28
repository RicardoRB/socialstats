import test from 'node:test';
import assert from 'node:assert';
import { buildAuthUrl, verifyState, exchangeCode } from './oauth';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

test('OAuth Utilities', async (t) => {
  const userId = 'user-123';
  const provider = 'youtube';
  const redirectTo = '/custom-redirect';

  await t.test('buildAuthUrl should generate a valid URL and state', () => {
    const { url, state } = buildAuthUrl(provider, userId, redirectTo);

    assert.ok(url.includes('https://accounts.google.com/o/oauth2/v2/auth'));
    assert.ok(url.includes('client_id=test-client-id'));
    assert.ok(url.includes('state='));
    assert.ok(state);
  });

  await t.test('buildAuthUrl should support PKCE for X provider', () => {
    process.env.X_CLIENT_ID = 'x-client-id';
    const { url, state } = buildAuthUrl('x', userId, redirectTo);

    assert.ok(url.includes('https://twitter.com/i/oauth2/authorize'));
    assert.ok(url.includes('code_challenge='));
    assert.ok(url.includes('code_challenge_method=S256'));

    const { codeVerifier } = verifyState(state, userId);
    assert.ok(codeVerifier);
    assert.strictEqual(codeVerifier.length, 64); // 32 bytes in hex
  });

  await t.test('verifyState should validate a correct state', () => {
    const { state } = buildAuthUrl(provider, userId, redirectTo);
    const { isValid, redirectTo: recoveredRedirectTo } = verifyState(state, userId);

    assert.strictEqual(isValid, true);
    assert.strictEqual(recoveredRedirectTo, redirectTo);
  });

  await t.test('verifyState should fail with incorrect userId', () => {
    const { state } = buildAuthUrl(provider, userId, redirectTo);
    const { isValid } = verifyState(state, 'wrong-user');

    assert.strictEqual(isValid, false);
  });

  await t.test('verifyState should fail with tampered signature', () => {
    const { state } = buildAuthUrl(provider, userId, redirectTo);
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    const parts = decoded.split('.');
    // Tamper with the payload
    const tamperedPayload = parts[0].replace(userId, 'attacker');
    const tamperedState = Buffer.from(`${tamperedPayload}.${parts[1]}`).toString('base64');

    const { isValid } = verifyState(tamperedState, userId);
    assert.strictEqual(isValid, false);
  });

  await t.test('verifyState should fail with invalid base64', () => {
    const { isValid } = verifyState('not-base64-!!!', userId);
    assert.strictEqual(isValid, false);
  });

  await t.test('exchangeCode should return tokens and extract provider_user_id', async () => {
    const mockResponse = {
      access_token: 'abc',
      refresh_token: 'def',
      expires_in: 3600,
      token_type: 'Bearer',
      id_token: `header.${Buffer.from(JSON.stringify({ sub: 'user-id-from-google' })).toString('base64')}.signature`
    };

    // Mock global fetch
    const originalFetch = global.fetch;
    global.fetch = (async () => ({
      ok: true,
      json: async () => mockResponse,
    })) as any;

    try {
      const tokens = await exchangeCode('youtube', 'some-code');
      assert.strictEqual(tokens.access_token, 'abc');
      assert.strictEqual(tokens.provider_user_id, 'user-id-from-google');
    } finally {
      global.fetch = originalFetch;
    }
  });

  await t.test('exchangeCode should include code_verifier for PKCE', async () => {
    let capturedBody: URLSearchParams | null = null;
    const originalFetch = global.fetch;
    global.fetch = (async (_url: string, options: any) => {
      capturedBody = new URLSearchParams(options.body);
      return {
        ok: true,
        json: async () => ({ access_token: 'x-token', token_type: 'Bearer' }),
      };
    }) as any;

    try {
      await exchangeCode('x', 'x-code', 'x-verifier');
      assert.strictEqual(capturedBody?.get('code_verifier'), 'x-verifier');
      assert.strictEqual(capturedBody?.get('code'), 'x-code');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
