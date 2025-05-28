import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check what tables exist
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables')
      .single()

    if (tablesError) {
      // Alternative method - try to query calendar_events
      const { data: calendarData, error: calendarError } = await supabase
        .from('calendar_events')
        .select('*')
        .limit(1)

      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)

      return NextResponse.json({
        method: 'table_query',
        calendar_events: {
          exists: !calendarError,
          error: calendarError?.message,
          sample: calendarData
        },
        organizations: {
          exists: !orgsError,
          error: orgsError?.message,
          sample: orgsData
        }
      })
    }

    return NextResponse.json({
      method: 'rpc_call',
      tables: tablesData
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}