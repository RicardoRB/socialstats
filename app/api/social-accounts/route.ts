import {NextResponse} from 'next/server';
import {createServer} from "@/lib/auth";

export async function GET() {
    const supabase = createServer();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {data, error} = await supabase
        .from('social_accounts')
        .select('id, provider, provider_user_id, display_name, avatar_url, last_synced_at')
        .eq('user_id', user.id)
        .order('connected_at', {ascending: false});

    if (error) {
        console.error('Error fetching social accounts:', error);
        return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json(data);
}
