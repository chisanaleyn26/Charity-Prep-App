import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testActivityLogging() {
  try {
    console.log('Testing activity logging...')
    
    // Get a test organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1)
      .single()
    
    if (orgError) {
      console.error('Error fetching organization:', orgError)
      return
    }
    
    console.log('Using organization:', org.name)
    
    // Get a test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
      .single()
    
    if (userError) {
      console.error('Error fetching user:', userError)
      return
    }
    
    console.log('Using user:', user.email)
    
    // Create a test activity
    const { data: activity, error: activityError } = await supabase
      .from('user_activities')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        activity_type: 'test.activity',
        resource_name: 'Test Activity from Script',
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
          description: 'This is a test activity created by the test script'
        }
      })
      .select()
      .single()
    
    if (activityError) {
      console.error('Error creating activity:', activityError)
      return
    }
    
    console.log('✅ Successfully created test activity:', activity.id)
    
    // Create a test audit log
    const { data: audit, error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        user_email: user.email,
        action: 'test.audit_log',
        resource_type: 'test',
        resource_name: 'Test Audit Log',
        severity: 'info',
        changes: {
          test: true,
          created_by: 'test script'
        }
      })
      .select()
      .single()
    
    if (auditError) {
      console.error('Error creating audit log:', auditError)
      return
    }
    
    console.log('✅ Successfully created test audit log:', audit.id)
    
    // Fetch recent activities via the API endpoint simulation
    const { data: recentActivities, error: fetchError } = await supabase
      .from('recent_activities')
      .select('*')
      .eq('organization_id', org.id)
      .limit(5)
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('Error fetching recent activities:', fetchError)
      return
    }
    
    console.log('\n📋 Recent Activities:')
    recentActivities.forEach(act => {
      console.log(`  - ${act.activity_type}: ${act.resource_name || 'N/A'} (${new Date(act.created_at).toLocaleString()})`)
    })
    
    // Test automatic audit logging by creating a safeguarding record
    console.log('\n🔄 Testing automatic audit logging...')
    
    const { data: safeguarding, error: safeguardingError } = await supabase
      .from('safeguarding_records')
      .insert({
        organization_id: org.id,
        person_name: 'Test Volunteer',
        check_type: 'enhanced_dbs',
        reference_number: 'TEST-' + Date.now(),
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'valid',
        is_active: true
      })
      .select()
      .single()
    
    if (safeguardingError) {
      console.error('Error creating safeguarding record:', safeguardingError)
    } else {
      console.log('✅ Created safeguarding record:', safeguarding.id)
      
      // Check if audit log was created automatically
      const { data: autoAudit, error: autoAuditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', org.id)
        .eq('action', 'safeguarding_records.created')
        .eq('resource_id', safeguarding.id)
        .single()
      
      if (autoAuditError) {
        console.error('❌ Automatic audit log not found:', autoAuditError)
      } else {
        console.log('✅ Automatic audit log created:', autoAudit.id)
        console.log('   Action:', autoAudit.action)
        console.log('   Resource:', autoAudit.resource_name)
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testActivityLogging()