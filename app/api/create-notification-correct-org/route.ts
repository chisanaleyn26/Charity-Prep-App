import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizationId } = body
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    console.log('Creating notification for org:', organizationId)
    
    // Create notification in the specified organization
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        organization_id: organizationId,
        type: 'test',
        title: 'Test Notification for Correct Org',
        message: `Created at ${new Date().toLocaleTimeString()} in the correct organization`,
        severity: 'success'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ 
        error: 'Failed to create notification',
        details: error
      }, { status: 500 })
    }
    
    console.log('Created notification:', data)
    
    return NextResponse.json({ 
      success: true,
      notification: data
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}