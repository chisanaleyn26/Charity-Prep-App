import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getComplianceStatistics } from '@/lib/services/compliance-statistics.service'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: orgMember, error: orgError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (orgError || !orgMember) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Get compliance statistics
    const statistics = await getComplianceStatistics(orgMember.organization_id)
    
    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error in compliance statistics API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance statistics' },
      { status: 500 }
    )
  }
}