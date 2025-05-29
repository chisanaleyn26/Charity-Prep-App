import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('Bypass test: Starting')
    
    const supabase = await createClient()
    
    // Just get the user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated', step: 'auth' }, { status: 401 })
    }
    
    console.log('Bypass test: User found:', user.id)
    
    // First, let's check what's in the database
    const { data: checkData, error: checkError } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(*)')
      .eq('user_id', user.id)
    
    console.log('Organizations check:', { checkData, checkError })
    
    if (!checkData || checkData.length === 0) {
      return NextResponse.json({ 
        error: 'No organizations found for user',
        user_id: user.id,
        step: 'no_orgs'
      }, { status: 400 })
    }
    
    // Use the first organization we find
    const orgId = checkData[0].organization_id
    const orgName = checkData[0].organizations?.name || 'Unknown'
    
    console.log('Bypass test: Using org:', orgId, orgName)
    
    // Simple insert with minimal data
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        organization_id: orgId,
        type: 'test',
        title: 'Bypass Test ' + new Date().getTime(),
        message: 'This is a bypass test notification',
        severity: 'info'
      })
      .select()
      .single()
    
    console.log('Insert result:', { data, error })
    
    if (error) {
      // Let's check what columns exist in the table
      const { data: tableInfo, error: tableError } = await supabase
        .from('notifications')
        .select('*')
        .limit(0)
      
      return NextResponse.json({ 
        error: 'Insert failed',
        details: error,
        org_id: orgId,
        org_name: orgName,
        user_id: user.id,
        table_check_error: tableError,
        step: 'insert'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      notification: data,
      org_id: orgId,
      org_name: orgName
    })
    
  } catch (error) {
    console.error('Bypass test error:', error)
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown',
      step: 'catch'
    }, { status: 500 })
  }
}