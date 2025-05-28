import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check calendar_events table structure
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        hint: error.hint 
      })
    }

    // Also check if we can access the table at all
    const { data: countData, error: countError } = await supabase
      .from('calendar_events')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({ 
      message: 'Database accessible',
      sampleRecord: data?.[0] || null,
      totalRecords: countData || 0,
      countError: countError?.message || null
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}