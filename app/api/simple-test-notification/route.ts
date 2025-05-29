import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get organizationId from request body
    const body = await request.json()
    const { organizationId } = body
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create one simple notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
        severity: 'info',
        link: '/dashboard'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to create notification',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      notification: data
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}