import { NextRequest, NextResponse } from 'next/server';
import { buildAuthUrl } from '@/lib/oauth';
import { createClient } from '@/lib/supabase-server';
import { getProvider } from '@/lib/providers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirectTo') || undefined;

  // Initialize Supabase client to get the user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // For development/testing purposes, if no user is found, we might want to have a fallback
    // but in production it should definitely be 401.
    // Given the ticket instructions, we need userId to build the state.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const providerInstance = getProvider(provider);
    if (providerInstance?.getAuthUrl) {
      return NextResponse.redirect(providerInstance.getAuthUrl(user.id, redirectTo));
    }

    const { url } = buildAuthUrl(provider, user.id, redirectTo);
    return NextResponse.redirect(url);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
