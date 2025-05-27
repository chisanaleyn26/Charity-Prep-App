import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_AUTO_LOGIN !== 'true') {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const supabase = await createClient()
    
    // First, check if we're already logged in
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (currentUser) {
      console.log('[DEV AUTO-LOGIN] User already logged in:', currentUser.email)
      redirect('/dashboard')
    }

    // For development, we'll use the dev bypass approach
    // This sets a cookie that the middleware recognizes
    const response = NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    
    // Set a dev session cookie
    const devUser = {
      id: 'dev-user-123',
      email: 'dev@charityprep.uk',
      role: 'admin',
      user_metadata: {
        full_name: 'Dev Admin',
        organization_id: 'dev-org-123',
      }
    }
    
    response.cookies.set('dev-auth-session', JSON.stringify(devUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    console.log('[DEV AUTO-LOGIN] Dev session created, redirecting to dashboard...')
    
    return response
  } catch (error) {
    console.error('[DEV AUTO-LOGIN] Unexpected error:', error)
    redirect('/login?error=dev-auto-login-exception')
  }
}