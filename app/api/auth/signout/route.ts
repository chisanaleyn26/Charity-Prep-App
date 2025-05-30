import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { withRateLimit, RateLimitConfigs } from '@/lib/security/rate-limiter'

export const POST = withRateLimit(
  RateLimitConfigs.auth.signout,
  async (request: Request) => {
    const supabase = await createServerClient()
    
    // Sign out the user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('[Auth] Signout error:', error)
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      )
    }
    
    // Clear any server-side session data
    // This ensures complete logout
    const response = NextResponse.json(
      { success: true, redirectUrl: '/login' },
      { status: 200 }
    )
    
    // Clear auth cookies
    response.cookies.set('sb-access-token', '', { maxAge: 0 })
    response.cookies.set('sb-refresh-token', '', { maxAge: 0 })
    
    return response
  }
)