import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deadlineId = params.id
    
    // Get request body
    const body = await request.json()
    const updateData: any = {}

    // Map frontend fields to database fields
    if (body.status !== undefined) updateData.status = body.status
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.date !== undefined) updateData.start_date = new Date(body.date).toISOString()
    if (body.type !== undefined) updateData.deadline_type = body.type
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.relatedUrl !== undefined) updateData.related_url = body.relatedUrl

    // Get existing deadline to check permissions
    const { data: existingDeadline, error: fetchError } = await supabase
      .from('calendar_events')
      .select('organization_id')
      .eq('id', deadlineId)
      .eq('event_type', 'deadline')
      .single()

    if (fetchError || !existingDeadline) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
    }

    // Verify user has access to organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', existingDeadline.organization_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied to organization' }, { status: 403 })
    }

    // Check if user can update deadlines (admin or member)
    if (!['admin', 'member'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update deadline
    const { data: deadline, error: updateError } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', deadlineId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating deadline:', updateError)
      return NextResponse.json({ error: 'Failed to update deadline' }, { status: 500 })
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

    return NextResponse.json({ deadline: transformedDeadline })
  } catch (error) {
    console.error('Error updating deadline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deadlineId = params.id

    // Get existing deadline to check permissions
    const { data: existingDeadline, error: fetchError } = await supabase
      .from('calendar_events')
      .select('organization_id')
      .eq('id', deadlineId)
      .eq('event_type', 'deadline')
      .single()

    if (fetchError || !existingDeadline) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
    }

    // Verify user has access to organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', existingDeadline.organization_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied to organization' }, { status: 403 })
    }

    // Check if user can delete deadlines (admin or member)
    if (!['admin', 'member'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Delete deadline
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', deadlineId)

    if (deleteError) {
      console.error('Error deleting deadline:', deleteError)
      return NextResponse.json({ error: 'Failed to delete deadline' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deadline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}