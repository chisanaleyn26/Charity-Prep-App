'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInSchema } from '@/lib/types/api.types'
import { getAuthCallbackUrl } from '@/lib/utils/auth-helpers'

export async function signIn(data: { email: string }) {
  const validatedFields = signInSchema.safeParse({
    email: data.email,
  })

  if (!validatedFields.success) {
    return { error: 'Invalid email address' }
  }

  const supabase = await createClient()
  
  // Use dynamic callback URL for Replit environments
  const callbackUrl = getAuthCallbackUrl()
  
  const { error } = await supabase.auth.signInWithOtp({
    email: validatedFields.data.email,
    options: {
      emailRedirectTo: callbackUrl,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getCurrentOrganization() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('user_id', user.id)
    .eq('accepted_at', 'not.null')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return membership?.organization || null
}

export async function getUserRole(organizationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: role } = await supabase
    .rpc('user_organization_role', {
      org_id: organizationId,
      user_id: user.id,
    })

  return role
}