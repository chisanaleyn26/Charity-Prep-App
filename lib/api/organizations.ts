'use server'

import { createClient } from '@/lib/supabase/server'
import { createOrganizationSchema, updateOrganizationSchema, inviteUserSchema } from '@/lib/types/api.types'
import { revalidatePath } from 'next/cache'

export async function createOrganization(data: unknown) {
  const validatedFields = createOrganizationSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid organization data' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Ensure user profile exists
  await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email!,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert(validatedFields.data)
    .select()
    .single()

  if (orgError) {
    return { error: orgError.message }
  }

  // Create membership for the creating user as admin
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'admin',
      accepted_at: new Date().toISOString(),
    })

  if (memberError) {
    return { error: memberError.message }
  }

  // Create trial subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      organization_id: org.id,
      tier: 'essentials',
      status: 'trialing',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })

  if (subError) {
    return { error: subError.message }
  }

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