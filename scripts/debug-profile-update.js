#!/usr/bin/env node

/**
 * Debug script to check profile update issues
 * This will help identify RLS or permission problems
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkwzcbqzxrmebcpgwyft.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // For admin operations

if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  process.exit(1)
}

// Create client with anon key (simulates frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create service client if available (bypasses RLS)
const serviceSupabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null

async function debugProfileUpdate() {
  console.log('🔍 Debugging Profile Update Issues\n')

  try {
    // 1. Check authentication
    console.log('1️⃣ Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Not authenticated:', authError)
      return
    }

    console.log('✅ Authenticated as:', user.email)
    console.log('   User ID:', user.id)
    console.log('\n')

    // 2. Try to read the user profile
    console.log('2️⃣ Trying to read user profile...')
    const { data: profile, error: readError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (readError) {
      console.error('❌ Read error - Full JSON:')
      console.error(JSON.stringify(readError, null, 2))
      console.log('\n')
      
      // If read fails, check if user exists using service role
      if (serviceSupabase) {
        console.log('🔑 Checking with service role (bypasses RLS)...')
        const { data: serviceProfile, error: serviceError } = await serviceSupabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (serviceError) {
          console.error('❌ User does not exist in users table')
          console.log('   This user needs to be created first')
        } else {
          console.log('✅ User exists (service role can see it)')
          console.log('⚠️  This indicates an RLS policy issue')
          console.log('   Profile data:', JSON.stringify(serviceProfile, null, 2))
        }
      }
    } else {
      console.log('✅ Profile read successful')
      console.log('   Current profile:', JSON.stringify(profile, null, 2))
    }
    console.log('\n')

    // 3. Try to update the profile
    console.log('3️⃣ Trying to update profile...')
    const testUpdate = {
      full_name: `Test User ${Date.now()}`,
      job_title: 'Test Job Title',
      updated_at: new Date().toISOString()
    }
    
    console.log('   Update data:', JSON.stringify(testUpdate, null, 2))
    
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update(testUpdate)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Update error - Full JSON:')
      console.error(JSON.stringify(updateError, null, 2))
      console.error('\nError breakdown:')
      console.error('  Message:', updateError.message)
      console.error('  Code:', updateError.code)
      console.error('  Details:', updateError.details)
      console.error('  Hint:', updateError.hint)
    } else {
      console.log('✅ Update successful!')
      console.log('   Updated data:', JSON.stringify(updateResult, null, 2))
    }
    console.log('\n')

    // 4. Try upsert instead of update
    console.log('4️⃣ Trying upsert (insert or update)...')
    const upsertData = {
      id: user.id,
      email: user.email,
      ...testUpdate
    }
    
    const { data: upsertResult, error: upsertError } = await supabase
      .from('users')
      .upsert(upsertData, { onConflict: 'id' })
      .select()
      .single()

    if (upsertError) {
      console.error('❌ Upsert error - Full JSON:')
      console.error(JSON.stringify(upsertError, null, 2))
    } else {
      console.log('✅ Upsert successful!')
      console.log('   Result:', JSON.stringify(upsertResult, null, 2))
    }
    console.log('\n')

    // 5. Check RLS policies
    console.log('5️⃣ Checking RLS policies...')
    console.log('   To fix RLS issues, you may need to:')
    console.log('   1. Ensure users can read their own records:')
    console.log('      CREATE POLICY "Users can read own profile" ON users')
    console.log('        FOR SELECT USING (auth.uid() = id);')
    console.log('   2. Ensure users can update their own records:')
    console.log('      CREATE POLICY "Users can update own profile" ON users')
    console.log('        FOR UPDATE USING (auth.uid() = id);')
    console.log('   3. Ensure users can insert their own record:')
    console.log('      CREATE POLICY "Users can insert own profile" ON users')
    console.log('        FOR INSERT WITH CHECK (auth.uid() = id);')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the debug script
debugProfileUpdate()