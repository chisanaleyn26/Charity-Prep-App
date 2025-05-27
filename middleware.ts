import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Set up headers for Replit environments to preserve original host
  const requestHeaders = new Headers(request.headers)
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
  if (host) {
    requestHeaders.set('x-original-host', host)
  }
  
  // For auth routes, always allow through
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/verify') ||
                     request.nextUrl.pathname.startsWith('/callback') ||
                     request.nextUrl.pathname.startsWith('/api/auth/callback')
  
  if (isAuthRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // Use Supabase auth with updated headers
  const response = await updateSession(request)
  
  // Ensure headers are preserved in the response
  response.headers.set('x-original-host', host || '')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}