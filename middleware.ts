import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Check for dev session cookie
  const devSession = request.cookies.get('dev-auth-session')
  
  // If dev session exists, allow through
  if (devSession) {
    return NextResponse.next()
  }
  
  // For auth routes and dev routes, always allow through
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/verify') ||
                     request.nextUrl.pathname.startsWith('/callback') ||
                     request.nextUrl.pathname.startsWith('/api/dev-auto-login') ||
                     request.nextUrl.pathname.startsWith('/api/dev-logout')
  
  if (isAuthRoute) {
    return NextResponse.next()
  }
  
  // Otherwise use Supabase auth
  return await updateSession(request)
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