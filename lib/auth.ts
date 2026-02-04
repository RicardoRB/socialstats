import {createBrowserClient, createServerClient} from '@supabase/auth-helpers-nextjs'
import {redirect} from 'next/navigation'
import {cookies} from "next/headers";

/**
 * Client-side Supabase client
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const createClient = () => createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
)

/**
 * Server-side Supabase client
 */
export function createServer() {

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                async getAll() {
                    const cookieStore =
                        await cookies()

                    return cookieStore.getAll();
                },
                async setAll(cookiesToSet) {
                    try {
                        const cookieStore = await cookies()

                        cookiesToSet.forEach(({name, value, options}) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

/**
 * Gets the current session on the server
 * @param _req Optional request object (for compatibility)
 */
export async function getSession(_req?: Request) {
    const supabase = await createServer()
    const {data: {session}} = await supabase.auth.getSession()
    return session
}

/**
 * Ensures the user is authenticated, otherwise redirects to login
 * @param _req Optional request object (for compatibility)
 */
export async function requireUser(_req?: Request) {
    const session = await getSession(_req)
    if (!session) {
        redirect('/login')
    }
    return session.user
}
