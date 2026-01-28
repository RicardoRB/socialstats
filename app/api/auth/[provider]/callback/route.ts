import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, verifyState } from '@/lib/oauth';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  // Initialize Supabase client
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Verify state
  const { isValid, redirectTo } = verifyState(state, user.id);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  try {
    // 2. Exchange code for tokens
    const tokens = await exchangeCode(provider, code);

    // 3. Persist tokens in social_accounts
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: user.id,
        provider,
        provider_user_id: tokens.provider_user_id || 'unknown',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      console.error('Database error saving tokens:', dbError);
      return NextResponse.json({ error: 'Database error: ' + dbError.message }, { status: 500 });
    }

    const finalRedirect = redirectTo || '/dashboard';
    const redirectUrl = new URL(finalRedirect, request.url);
    redirectUrl.searchParams.set('connected', 'y');

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
