import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { trackActivity } from '@/features/teams/services/team-management.service'

/**
 * Middleware to track user activity
 */
export async function trackUserActivity(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return
    
    // Get user's organizations
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
    
    if (!memberships || memberships.length === 0) return
    
    // Track activity for each organization
    const pathname = request.nextUrl.pathname
    const activityType = getActivityType(pathname)
    
    if (activityType) {
      for (const membership of memberships) {
        await trackActivity({
          organizationId: membership.organization_id,
          userId: user.id,
          activityType,
          metadata: {
            path: pathname,
            method: request.method,
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  } catch (error) {
    // Don't block requests if tracking fails
    console.error('Failed to track activity:', error)
  }
}

/**
 * Determine activity type based on pathname
 */
function getActivityType(pathname: string): string | null {
  if (pathname.startsWith('/compliance')) return 'compliance.view'
  if (pathname.startsWith('/documents')) return 'documents.view'
  if (pathname.startsWith('/reports')) return 'reports.view'
  if (pathname.startsWith('/dashboard')) return 'dashboard.view'
  if (pathname.startsWith('/settings')) return 'settings.view'
  if (pathname.startsWith('/ai')) return 'ai.use'
  return null
}