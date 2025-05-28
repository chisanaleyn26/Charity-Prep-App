'use server'

import { createClient } from '@/lib/supabase/server'
import { createOrganizationSchema, updateOrganizationSchema, inviteUserSchema } from '@/lib/types/api.types'
import { revalidatePath } from 'next/cache'

export async function createOrganization(data: unknown) {
  console.log('createOrganization called with data:', JSON.stringify(data, null, 2))
  
  const validatedFields = createOrganizationSchema.safeParse(data)

  if (!validatedFields.success) {
    console.error('Validation failed:', JSON.stringify(validatedFields.error.issues, null, 2))
    const errorMessages = validatedFields.error.issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    ).join(', ')
    return { error: `Validation failed: ${errorMessages}` }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('Auth error details:', JSON.stringify(authError, null, 2))
    return { error: `Authentication failed: ${authError.message}` }
  }

  if (!user) {
    console.error('No user found in session - auth.getUser() returned null')
    return { error: 'Unauthorized - no user session found' }
  }

  console.log('✅ User authenticated successfully:', user.id)
  console.log('User details:', JSON.stringify({
    id: user.id,
    email: user.email,
    created_at: user.created_at
  }, null, 2))

  // Ensure user profile exists
  console.log('📝 Step 1: Upserting user profile for:', user.id, user.email)
  const userUpsertData = {
    id: user.id,
    email: user.email!,
    created_at: new Date().toISOString()
  }
  console.log('User upsert data:', JSON.stringify(userUpsertData, null, 2))
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert(userUpsertData, {
      onConflict: 'id'
    })
    .select()

  if (userError) {
    console.error('❌ User upsert failed:', JSON.stringify(userError, null, 2))
    return { error: `Failed to create user profile: ${userError.message} (Code: ${userError.code || 'unknown'})` }
  }
  
  console.log('✅ User profile upserted successfully:', userData)

  // Convert financial_year_end from DD-MM format to proper date
  console.log('📝 Step 2: Processing organization data')
  const orgData = { ...validatedFields.data }
  console.log('Original organization data:', JSON.stringify(orgData, null, 2))
  
  if (orgData.financial_year_end) {
    const [day, month] = orgData.financial_year_end.split('-')
    const convertedDate = `2024-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    console.log(`Converting financial_year_end: ${orgData.financial_year_end} -> ${convertedDate}`)
    orgData.financial_year_end = convertedDate
  }
  
  // Handle empty charity number (set to null for database)
  if (orgData.charity_number === '') {
    console.log('Converting empty charity_number to null')
    orgData.charity_number = null
  }

  console.log('📝 Step 3: Inserting organization into database')
  console.log('Final organization data:', JSON.stringify(orgData, null, 2))
  
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert(orgData)
    .select()
    .single()

  if (orgError) {
    console.error('❌ Organization creation failed:', JSON.stringify(orgError, null, 2))
    console.error('Full error details:', {
      message: orgError.message,
      code: orgError.code,
      details: orgError.details,
      hint: orgError.hint
    })
    return { error: `Failed to create organization: ${orgError.message} ${orgError.hint ? `(Hint: ${orgError.hint})` : ''} (Code: ${orgError.code || 'unknown'})` }
  }
  
  console.log('✅ Organization created successfully:', JSON.stringify(org, null, 2))

  // Create membership for the creating user as admin
  console.log('📝 Step 4: Creating admin membership')
  const membershipData = {
    organization_id: org.id,
    user_id: user.id,
    role: 'admin',
    accepted_at: new Date().toISOString(),
  }
  console.log('Membership data:', JSON.stringify(membershipData, null, 2))
  
  const { data: memberData, error: memberError } = await supabase
    .from('organization_members')
    .insert(membershipData)
    .select()

  if (memberError) {
    console.error('❌ Membership creation failed:', JSON.stringify(memberError, null, 2))
    console.error('Full membership error details:', {
      message: memberError.message,
      code: memberError.code,
      details: memberError.details,
      hint: memberError.hint
    })
    return { error: `Failed to create membership: ${memberError.message} ${memberError.hint ? `(Hint: ${memberError.hint})` : ''} (Code: ${memberError.code || 'unknown'})` }
  }
  
  console.log('✅ Membership created successfully:', JSON.stringify(memberData, null, 2))

  // Create trial subscription
  console.log('📝 Step 5: Creating trial subscription')
  const subscriptionData = {
    organization_id: org.id,
    tier: 'essentials',
    status: 'trialing',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  }
  console.log('Subscription data:', JSON.stringify(subscriptionData, null, 2))

  const { data: subData, error: subError } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select()

  if (subError) {
    console.error('❌ Subscription creation failed:', JSON.stringify(subError, null, 2))
    console.error('Full subscription error details:', {
      message: subError.message,
      code: subError.code,
      details: subError.details,
      hint: subError.hint
    })
    return { error: `Failed to create subscription: ${subError.message} ${subError.hint ? `(Hint: ${subError.hint})` : ''} (Code: ${subError.code || 'unknown'})` }
  }
  
  console.log('✅ Subscription created successfully:', JSON.stringify(subData, null, 2))
  console.log('🎉 Complete onboarding process finished successfully!')

  revalidatePath('/dashboard')
  return { data: org }
}

export async function updateOrganization(id: string, data: unknown) {
  const validatedFields = updateOrganizationSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid organization data' }
  }

  const supabase = await createClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .update(validatedFields.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings/organization')
  return { data: org }
}

export async function inviteUser(organizationId: string, data: unknown) {
  const validatedFields = inviteUserSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid invitation data' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', validatedFields.data.email)
    .single()

  if (existingUser) {
    // Check if already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', existingUser.id)
      .single()

    if (existingMember) {
      return { error: 'User is already a member of this organization' }
    }

    // Add existing user to organization
    const { error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: existingUser.id,
        role: validatedFields.data.role,
        invited_by: user.id,
        invited_at: new Date().toISOString(),
      })

    if (error) {
      return { error: error.message }
    }
  } else {
    // Send invitation email through Supabase Auth
    const { error } = await supabase.auth.admin.inviteUserByEmail(
      validatedFields.data.email,
      {
        data: {
          organization_id: organizationId,
          role: validatedFields.data.role,
          invited_by: user.id,
        },
      }
    )

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/settings/team')
  return { success: true }
}

export async function removeUser(organizationId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings/team')
  return { success: true }
}

export async function updateUserRole(organizationId: string, userId: string, role: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings/team')
  return { success: true }
}