import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Simple query - just count notifications
    const { count: totalCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
    
    // Get a few notifications
    const { data: notifications, error: dataError } = await supabase
      .from('notifications')
      .select('id, organization_id, type, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    return NextResponse.json({
      total_count: totalCount || 0,
      count_error: countError,
      recent_notifications: notifications || [],
      data_error: dataError,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}