'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInSchema } from '@/lib/types/api.types'

export async function signIn(data: { email: string }) {
  const validatedFields = signInSchema.safeParse({
    email: data.email,
  })

  if (!validatedFields.success) {
    return { error: 'Invalid email address' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email: validatedFields.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
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
  // Check for dev session first
  if (process.env.NODE_ENV === 'development') {
    const { getDevSession } = await import('@/lib/dev/dev-auth')
    const { getMockUser } = await import('@/lib/dev/is-dev-mode')
    const devSession = await getDevSession()
    
    if (devSession) {
      return getMockUser()
    }
  }

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
  // Check for dev session first
  if (process.env.NODE_ENV === 'development') {
    const { getDevSession } = await import('@/lib/dev/dev-auth')
    const { getMockOrganization } = await import('@/lib/dev/is-dev-mode')
    const devSession = await getDevSession()
    
    if (devSession) {
      // Return mock organization for dev mode
      return getMockOrganization()
    }
  }

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