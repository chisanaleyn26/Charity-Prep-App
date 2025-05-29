import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's organizations
    const { data: orgMembers, error: orgError } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(name)')
      .eq('user_id', user.id)
    
    if (!orgMembers || orgMembers.length === 0) {
      return NextResponse.json({ 
        error: 'No organizations found',
        user_id: user.id
      }, { status: 400 })
    }

    const orgId = orgMembers[0].organization_id
    const orgName = orgMembers[0].organizations?.name || 'Unknown'

    // Check ALL notifications in the database for this org
    const { data: allNotifications, error: allError } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Check notifications visible to this user
    const { data: userNotifications, error: userError } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},and(user_id.is.null,organization_id.eq.${orgId})`)
      .is('dismissed_at', null)
      .order('created_at', { ascending: false })
      .limit(10)

    // Check if there are any dismissed notifications
    const { data: dismissedNotifications, error: dismissedError } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', orgId)
      .not('dismissed_at', 'is', null)
      .limit(5)

    // Try to create a test notification and return it immediately
    const testNotification = {
      organization_id: orgId,
      type: 'debug_test',
      title: 'Debug Test ' + new Date().toISOString(),
      message: 'Created by debug endpoint',
      severity: 'info' as const
    }

    const { data: newNotification, error: createError } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select()
      .single()

    // Check the exact query used by getNotifications
    const { data: apiStyleQuery, error: apiError, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .or(`user_id.eq.${user.id},and(user_id.is.null,organization_id.eq.${orgId})`)
      .is('dismissed_at', null)
      .order('created_at', { ascending: false })
      .range(0, 19)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      organization: {
        id: orgId,
        name: orgName
      },
      queries: {
        all_in_org: {
          count: allNotifications?.length || 0,
          data: allNotifications,
          error: allError
        },
        visible_to_user: {
          count: userNotifications?.length || 0,
          data: userNotifications,
          error: userError
        },
        dismissed: {
          count: dismissedNotifications?.length || 0,
          data: dismissedNotifications,
          error: dismissedError
        },
        api_style: {
          count: count || 0,
          data: apiStyleQuery,
          error: apiError
        }
      },
      new_notification: {
        attempted: testNotification,
        result: newNotification,
        error: createError
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}