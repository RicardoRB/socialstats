import {createServerClient} from '@supabase/auth-helpers-nextjs'
import {cookies} from 'next/headers'
import {redirect} from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export function createServerSupabaseClient() {
    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                async getAll() {
                    const cookieStore = await cookies()
                    return cookieStore.getAll()
                },
                async setAll(cookiesToSet) {
                    try {
                        const cookieStore = await cookies()
                        cookiesToSet.forEach(({name, value, options}) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore in client components
                    }
                },
            },
        }
    )
}

/** * Gets the current session on the server * @param _req Optional request object (for compatibility) */
export async function getSession() {
    const supabase = createServerSupabaseClient()
    const {data: {session}} = await supabase.auth.getSession()
    return session
}

/** * Ensures the user is authenticated, otherwise redirects to login * @param _req Optional request object (for compatibility) */
export async function requireUser() {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }
    return session.user
}