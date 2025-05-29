import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: authError?.message 
      }, { status: 401 })
    }

    // Get user's organizations
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)

    if (membershipError) {
      return NextResponse.json({ 
        error: 'Failed to get user organizations',
        details: membershipError.message,
        userId: user.id
      }, { status: 500 })
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ 
        deadlines: [],
        message: 'No organizations found for user'
      })
    }

    const orgIds = memberships.map(m => m.organization_id)

    // Get deadlines (calendar events with event_type = 'deadline')
    const { data: deadlines, error: deadlinesError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('event_type', 'deadline')
      .in('organization_id', orgIds)
      .order('start_date', { ascending: true })

    if (deadlinesError) {
      return NextResponse.json({ 
        error: 'Failed to fetch deadlines',
        details: deadlinesError.message,
        hint: deadlinesError.hint,
        code: deadlinesError.code,
        orgIds
      }, { status: 500 })
    }

    // Handle case where no deadlines exist
    if (!deadlines) {
      return NextResponse.json({ deadlines: [] })
    }

    // Transform to frontend format
    const transformedDeadlines = deadlines.map(deadline => ({
      id: deadline.id,
      title: deadline.title,
      description: deadline.description || '',
      date: new Date(deadline.start_date),
      type: deadline.deadline_type || 'other',
      priority: deadline.priority || 'medium',
      status: deadline.status || 'upcoming',
      relatedUrl: deadline.related_url || undefined
    }))

    return NextResponse.json({ 
      deadlines: transformedDeadlines,
      count: transformedDeadlines.length,
      organizationIds: orgIds
    })
  } catch (error) {
    console.error('Error fetching deadlines:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: authError?.message 
      }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { title, description, date, type, priority, relatedUrl, organizationId } = body

    // Validate required fields
    if (!title || !date || !type || !priority || !organizationId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        received: { title: !!title, date: !!date, type: !!type, priority: !!priority, organizationId: !!organizationId }
      }, { status: 400 })
    }

    // Verify user has access to organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ 
        error: 'Access denied to organization',
        details: membershipError?.message,
        organizationId,
        userId: user.id
      }, { status: 403 })
    }

    // Check if user can create deadlines (admin or member)
    if (!['admin', 'member'].includes(membership.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        userRole: membership.role
      }, { status: 403 })
    }

    // Prepare deadline data
    const deadlineData = {
      organization_id: organizationId,
      title,
      description: description || null,
      event_type: 'deadline',
      start_date: new Date(date).toISOString(),
      all_day: true,
      deadline_type: type,
      priority,
      status: 'upcoming',
      related_url: relatedUrl || null,
      created_by: user.id
    }

    // Create deadline
    const { data: deadline, error: createError } = await supabase
      .from('calendar_events')
      .insert(deadlineData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating deadline:', createError)
      return NextResponse.json({ 
        error: 'Failed to create deadline',
        details: createError.message,
        hint: createError.hint,
        code: createError.code,
        sentData: deadlineData
      }, { status: 500 })
    }

    // Transform to frontend format
    const transformedDeadline = {
      id: deadline.id,
      title: deadline.title,
      description: deadline.description || '',
      date: new Date(deadline.start_date),
      type: deadline.deadline_type || 'other',
      priority: deadline.priority || 'medium',
      status: deadline.status || 'upcoming',
      relatedUrl: deadline.related_url || undefined
    }

    return NextResponse.json({ 
      deadline: transformedDeadline,
      message: 'Deadline created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating deadline:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}