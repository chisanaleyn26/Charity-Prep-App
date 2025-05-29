#!/usr/bin/env node

/**
 * Test script to verify profile update functionality
 * Run this script to test the profile update server action
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkwzcbqzxrmebcpgwyft.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update Functionality\n')

  // Test data
  const testProfileData = {
    full_name: 'Test User Updated',
    phone: '+44 123 456 7890',
    job_title: 'Charity Manager',
    department: 'Operations',
    bio: 'Test bio for profile update',
    linkedin_url: 'https://linkedin.com/in/testuser',
    years_in_charity_sector: 5
  }

  console.log('📤 Sending profile update with data:')
  console.log(JSON.stringify(testProfileData, null, 2))
  console.log('\n')

  try {
    // First, get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Not authenticated. Please login first.')
      return
    }

    console.log('✅ Authenticated as:', user.email)
    console.log('User ID:', user.id)
    console.log('\n')

    // Update the profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...testProfileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Profile update failed:')
      console.error(JSON.stringify(updateError, null, 2))
      return
    }

    console.log('✅ Profile updated successfully!')
    console.log('\n📥 Response from database:')
    console.log(JSON.stringify(updatedUser, null, 2))

    // Verify the update by fetching the profile again
    console.log('\n🔍 Verifying update by fetching profile again...')
    const { data: verifiedUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return
    }

    console.log('✅ Verification successful!')
    console.log('\n📋 Current profile data:')
    console.log(JSON.stringify(verifiedUser, null, 2))

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testProfileUpdate()