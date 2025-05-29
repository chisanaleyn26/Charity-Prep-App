import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    console.log('Test notifications API called')
    const supabase = await createClient()
    
    // Get organizationId from request body
    const body = await request.json()
    const { organizationId } = body
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }
    
    // Get the current user for user_id field
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User error:', userError)
      return NextResponse.json({ error: 'Auth error: ' + userError.message }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found')
      return NextResponse.json({ error: 'Unauthorized - no user' }, { status: 401 })
    }

    console.log('User found:', user.id)
    console.log('Using organization ID:', organizationId)

    // Create sample notifications with valid types
    const notifications = [
      {
        organization_id: organizationId,
        user_id: user.id,
        type: 'expiry_warning',
        title: 'DBS Checks Expiring Soon',
        message: '3 DBS checks will expire in the next 30 days. Please review and renew.',
        severity: 'warning',
        link: '/compliance/safeguarding'
      },
      {
        organization_id: organizationId,
        user_id: user.id,
        type: 'deadline_reminder',
        title: 'Annual Return Due',
        message: 'Your charity\'s annual return is due in 60 days. Start preparing now.',
        severity: 'info',
        link: '/reports/annual-return'
      },
      {
        organization_id: organizationId,
        user_id: user.id,
        type: 'compliance_alert',
        title: 'Compliance Score Improved',
        message: 'Your compliance score has increased to 92% - well done!',
        severity: 'success'
      },
      {
        organization_id: organizationId,
        user_id: user.id,
        type: 'user_action',
        title: 'Document Upload Required',
        message: 'Please upload your updated safeguarding policy.',
        severity: 'warning',
        link: '/documents',
        read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      },
      {
        organization_id: organizationId,
        user_id: user.id,
        type: 'system_update',
        title: 'New Fundraising Guidelines',
        message: 'The Charity Commission has published updated fundraising guidelines.',
        severity: 'info',
        link: '/compliance/chat',
        read_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
      }
    ]

    console.log('Inserting notifications:', notifications.length)
    
    // Insert notifications
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) {
      console.error('Error creating notifications:', error)
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('Created notifications:', data?.length || 0)

    return NextResponse.json({ 
      success: true, 
      message: `Created ${data?.length || 0} test notifications`,
      data,
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Error in test notifications:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}