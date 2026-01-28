import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

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
export async function createServer() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // This can be ignored if called from a Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // This can be ignored if called from a Server Component
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
  const { data: { session } } = await supabase.auth.getSession()
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
