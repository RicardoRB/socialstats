import {type NextRequest, NextResponse} from 'next/server'
import {createServer} from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServer();

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
