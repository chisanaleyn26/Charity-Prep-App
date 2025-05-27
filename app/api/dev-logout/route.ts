import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  
  // Clear dev session cookie
  response.cookies.delete('dev-auth-session')
  
  // Also try to sign out from Supabase if there's a real session
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('[DEV LOGOUT] Error signing out from Supabase:', error)
  }
  
  console.log('[DEV LOGOUT] Session cleared, redirecting to login...')
  
  return response
}