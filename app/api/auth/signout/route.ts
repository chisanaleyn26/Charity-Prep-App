import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createServerClient()
  
  // Sign out the user
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
  
  // Redirect to login page
  return NextResponse.json(
    { success: true, redirectUrl: '/login' },
    { status: 200 }
  )
}