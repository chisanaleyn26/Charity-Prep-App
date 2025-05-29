import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get the current user and organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!orgMember) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Create sample safeguarding records with various expiry dates
    const now = new Date()
    const records = [
      {
        organization_id: orgMember.organization_id,
        person_name: 'John Smith',
        role: 'Youth Worker',
        dbs_number: '001234567890',
        issue_date: new Date(now.getFullYear() - 2, now.getMonth(), 1).toISOString().split('T')[0],
        expiry_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15).toISOString().split('T')[0], // Expires in 15 days
        dbs_type: 'enhanced_with_barred',
        is_active: true,
        training_completed: true,
        training_date: new Date(now.getFullYear() - 1, now.getMonth(), 15).toISOString().split('T')[0]
      },
      {
        organization_id: orgMember.organization_id,
        person_name: 'Sarah Johnson',
        role: 'Volunteer Coordinator',
        dbs_number: '001234567891',
        issue_date: new Date(now.getFullYear() - 3, now.getMonth(), 1).toISOString().split('T')[0],
        expiry_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).toISOString().split('T')[0], // Expires in 5 days
        dbs_type: 'enhanced',
        is_active: true,
        training_completed: true,
        training_date: new Date(now.getFullYear() - 1, now.getMonth(), 20).toISOString().split('T')[0]
      },
      {
        organization_id: orgMember.organization_id,
        person_name: 'Michael Brown',
        role: 'Trustee',
        dbs_number: '001234567892',
        issue_date: new Date(now.getFullYear() - 3, now.getMonth() - 6, 1).toISOString().split('T')[0],
        expiry_date: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0], // Already expired
        dbs_type: 'basic',
        is_active: true,
        training_completed: true,
        training_date: new Date(now.getFullYear() - 2, now.getMonth(), 10).toISOString().split('T')[0]
      }
    ]

    // Insert safeguarding records
    const { data, error } = await supabase
      .from('safeguarding_records')
      .insert(records)
      .select()

    if (error) {
      console.error('Error creating safeguarding records:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Created ${data.length} safeguarding records`,
      data,
      note: 'Run daily checks to generate notifications for expiring DBS checks'
    })
  } catch (error) {
    console.error('Error in test safeguarding data:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}