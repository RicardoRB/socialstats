import { createHmac, randomBytes } from 'crypto';

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  id_token?: string;
  provider_user_id?: string;
}

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  authEndpoint: string;
  tokenEndpoint: string;
  scope: string;
}

function getProviders(): Record<string, ProviderConfig> {
  return {
    youtube: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
    },
  };
}

function getSecret() {
  return process.env.JWT_SECRET || 'fallback-secret-for-development-only';
}

export function buildAuthUrl(provider: string, userId: string, redirectTo?: string): { url: string; state: string } {
  const config = getProviders()[provider];
  if (!config) throw new Error(`Unsupported provider: ${provider}`);

  const timestamp = Date.now();
  const nonce = randomBytes(8).toString('hex');
  const payload = JSON.stringify({ userId, timestamp, nonce, redirectTo });
  const signature = createHmac('sha256', getSecret()).update(payload).digest('hex');
  const state = Buffer.from(`${payload}.${signature}`).toString('base64');

  const url = new URL(config.authEndpoint);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', getRedirectUri(provider));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');

  return { url: url.toString(), state };
}

export function verifyState(state: string, userId: string): { isValid: boolean; redirectTo?: string } {
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    const lastDotIndex = decoded.lastIndexOf('.');
    if (lastDotIndex === -1) return { isValid: false };

    const payloadStr = decoded.substring(0, lastDotIndex);
    const signature = decoded.substring(lastDotIndex + 1);

    const expectedSignature = createHmac('sha256', getSecret()).update(payloadStr).digest('hex');
    if (signature !== expectedSignature) return { isValid: false };

    const payload = JSON.parse(payloadStr);

    // Check if it belongs to the user
    if (payload.userId !== userId) return { isValid: false };

    // Check expiration (10 minutes)
    const now = Date.now();
    if (now - payload.timestamp > 10 * 60 * 1000) return { isValid: false };

    return { isValid: true, redirectTo: payload.redirectTo };
  } catch (e) {
    return { isValid: false };
  }
}

export async function exchangeCode(provider: string, code: string): Promise<TokenResponse> {
  const config = getProviders()[provider];
  if (!config) throw new Error(`Unsupported provider: ${provider}`);

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: getRedirectUri(provider),
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data = await response.json();

  // Extract provider_user_id if id_token is present (OIDC)
  if (data.id_token) {
    try {
      const base64Payload = data.id_token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      data.provider_user_id = payload.sub;
    } catch (e) {
      console.error('Failed to decode id_token', e);
    }
  }

  return data;
}

function getRedirectUri(provider: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/auth/${provider}/callback`;
}
