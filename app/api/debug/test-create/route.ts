import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 })
    }

    // Get user's first organization
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)

    if (membershipError || !memberships?.length) {
      return NextResponse.json({ 
        error: 'No organization found', 
        details: membershipError?.message,
        userId: user.id
      }, { status: 400 })
    }

    const organizationId = memberships[0].organization_id

    // Try to create a simple test calendar event
    const testEvent = {
      organization_id: organizationId,
      title: 'Test Deadline - ' + new Date().toLocaleTimeString(),
      description: 'This is a test deadline created for debugging',
      event_type: 'deadline',
      start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
      all_day: true,
      deadline_type: 'other',
      priority: 'medium',
      status: 'upcoming',
      created_by: user.id
    }

    const { data: createdEvent, error: createError } = await supabase
      .from('calendar_events')
      .insert(testEvent)
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ 
        error: 'Failed to create event', 
        details: createError.message,
        hint: createError.hint,
        testEvent
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      event: createdEvent,
      organizationId
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}