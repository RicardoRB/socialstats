import {type CookieOptions, createServerClient} from '@supabase/auth-helpers-nextjs'
import {type NextRequest, NextResponse} from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // This will refresh the session if needed
    const {data: {user}} = await supabase.auth.getUser()

    const {pathname} = request.nextUrl

    // Protected routes
    const isDashboardPage = pathname.startsWith('/dashboard')
    const isApiRoute = pathname.startsWith('/api')

    if ((isDashboardPage || isApiRoute) && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/:path*',
    ],
}
