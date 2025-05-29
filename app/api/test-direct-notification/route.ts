import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('Direct notification test started')
    
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User error:', userError)
      return NextResponse.json({ 
        step: 'auth',
        error: 'Auth error', 
        details: userError 
      }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user')
      return NextResponse.json({ 
        step: 'auth',
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    console.log('User found:', user.id, user.email)

    // Get user's first organization
    const { data: orgMembers, error: orgError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
    
    console.log('Org query result:', { orgMembers, orgError })

    if (orgError) {
      return NextResponse.json({ 
        step: 'org_fetch',
        error: 'Organization fetch error',
        details: orgError,
        user_id: user.id
      }, { status: 400 })
    }

    if (!orgMembers || orgMembers.length === 0) {
      return NextResponse.json({ 
        step: 'no_org',
        error: 'No organization found',
        user_id: user.id
      }, { status: 400 })
    }

    const orgId = orgMembers[0].organization_id
    console.log('Using organization:', orgId)

    // Create a test notification with minimal data
    const notificationData = {
      organization_id: orgId,
      type: 'test',
      title: 'Direct Test ' + Date.now(),
      message: 'This is a direct test notification',
      severity: 'info' as const
    }
    
    console.log('Inserting notification:', notificationData)

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    console.log('Insert result:', { data, error })

    if (error) {
      return NextResponse.json({ 
        step: 'insert',
        error: 'Failed to create notification',
        details: error,
        attempted_data: notificationData
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      notification: data,
      org_id: orgId,
      user_id: user.id
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      step: 'catch',
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}