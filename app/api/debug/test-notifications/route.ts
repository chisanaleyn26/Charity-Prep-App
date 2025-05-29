import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return NextResponse.json({ 
        error: 'Auth error', 
        details: userError.message 
      }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's organization
    const { data: orgMember, error: orgError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (orgError) {
      return NextResponse.json({ 
        error: 'Organization error', 
        details: orgError.message,
        code: orgError.code 
      }, { status: 400 })
    }

    if (!orgMember) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Check what's in the notifications table
    const { data: existingNotifications, error: checkError } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', orgMember.organization_id)
      .limit(5)

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      organization_id: orgMember.organization_id,
      existing_notifications: existingNotifications || [],
      existing_count: existingNotifications?.length || 0,
      check_error: checkError
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}