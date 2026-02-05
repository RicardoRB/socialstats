import {NextRequest, NextResponse} from 'next/server';
import {exchangeCode, verifyState} from '@/lib/oauth';
import {providers} from '@/lib/providers';
import {createServerSupabaseClient} from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ provider: string }> }
) {
    const {provider} = await context.params;
    const {searchParams} = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
        return NextResponse.json({error: 'Missing code or state'}, {status: 400});
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    try {
        const providerHelper = providers[provider];
        let redirectTo: string | undefined;

        if (providerHelper && providerHelper.exchangeCodeAndSave) {
            const result = await providerHelper.exchangeCodeAndSave(code, state, user.id, supabase);
            redirectTo = result.redirectTo;
        } else {
            // Generic fallback
            // 1. Verify state
            const stateResult = verifyState(state, user.id);
            if (!stateResult.isValid) {
                return NextResponse.json({error: 'Invalid state'}, {status: 400});
            }
            redirectTo = stateResult.redirectTo;

            // 2. Exchange code for tokens
            const tokens = await exchangeCode(provider, code);

            // 3. Persist tokens in social_accounts
            const {error: dbError} = await supabase
                .from('social_accounts')
                .upsert({
                    user_id: user.id,
                    provider,
                    provider_user_id: tokens.provider_user_id || 'unknown',
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
                }, {
                    onConflict: 'user_id,provider,provider_user_id'
                });

            if (dbError) {
                console.error('Database error saving tokens:', dbError);
                return NextResponse.json({error: 'Database error: ' + dbError.message}, {status: 500});
            }
        }

        const finalRedirect = redirectTo || '/dashboard';
        const redirectUrl = new URL(finalRedirect, request.url);
        redirectUrl.searchParams.set('connected', 'y');

        return NextResponse.redirect(redirectUrl);
    } catch (error: any) {
        console.error('OAuth callback error:', error);
        return NextResponse.json({error: error.message}, {status: 400});
    }
}
