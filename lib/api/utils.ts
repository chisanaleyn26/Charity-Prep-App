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

/**
 * Common error handler for API responses
 */
export function handleApiError(error: any): { error: string } {
  console.error('API Error:', error)
  
  if (error.code === 'PGRST301') {
    return { error: 'You do not have permission to perform this action' }
  }
  
  if (error.code === '23505') {
    return { error: 'This record already exists' }
  }
  
  if (error.code === '23503') {
    return { error: 'Cannot delete record as it is referenced by other data' }
  }
  
  return { error: error.message || 'An unexpected error occurred' }
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Calculate days until a date
 */
export function daysUntil(date: string | Date): number {
  const target = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  
  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Get current financial year based on organization's year end
 */
export function getCurrentFinancialYear(yearEnd: string): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  
  // Parse month and day from MM-DD format
  const [endMonth, endDay] = yearEnd.split('-').map(Number)
  const yearEndDate = new Date(currentYear, endMonth - 1, endDay)
  
  // If we're past the year end date, we're in the next financial year
  if (today > yearEndDate) {
    return currentYear + 1
  }
  
  return currentYear
}