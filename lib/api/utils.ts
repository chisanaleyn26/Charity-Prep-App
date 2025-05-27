'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Ensures user is authenticated and returns user data
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  return user
}

/**
 * Gets user's role in an organization
 * Returns null if user doesn't have access
 */
export async function requireOrgAccess(organizationId: string, minRole?: 'viewer' | 'member' | 'admin') {
  const supabase = await createClient()
  const user = await requireAuth()
  
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()
  
  if (!member) {
    redirect('/dashboard')
  }
  
  // Check minimum role requirement
  if (minRole) {
    const roleHierarchy = { viewer: 0, member: 1, admin: 2 }
    const userRoleLevel = roleHierarchy[member.role as keyof typeof roleHierarchy]
    const requiredRoleLevel = roleHierarchy[minRole]
    
    if (userRoleLevel < requiredRoleLevel) {
      redirect('/dashboard')
    }
  }
  
  return member.role
}