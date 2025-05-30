import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AuthErrors, AuthError } from '@/lib/errors/auth-errors'

// Internal non-memoized version for special cases
async function _createClient(req?: NextApiRequest, res?: NextApiResponse) {
  // For App Router (default) - only use when not in Pages Router context
  if (!req && !res) {
    try {
      // Dynamically import cookies to avoid build errors in Pages Router
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      
      return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
          },
        }
      )
    } catch {
      // Fall back to empty cookies if next/headers is not available
      return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return []
            },
            setAll() {
              // No-op in fallback
            },
          },
        }
      )
    }
  }

  // For Pages Router compatibility
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (req?.cookies) {
            return Object.entries(req.cookies).map(([name, value]) => ({
              name,
              value: value || '',
            }))
          }
          return []
        },
        setAll(cookiesToSet) {
          if (res) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options ? Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ') : ''}`)
            })
          }
        },
      },
    }
  )
}

// App Router version - no memoization for now
export const createClient = async () => {
  return _createClient()
}

// Helper to get current user
export const getCurrentUser = async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

// Helper to get current organization with detailed error handling
export const getCurrentUserOrganization = async () => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('[Auth] Failed to get user:', authError)
    throw AuthErrors.notAuthenticated()
  }

  // First, get the user's current_organization_id from the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('current_organization_id')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error('[Auth] Failed to get user data:', userError)
    throw new AuthError({
      code: 'USER_PROFILE_ERROR' as any,
      message: 'Failed to load user profile',
      userMessage: 'There was a problem loading your profile. Please try again.',
      technicalDetails: { error: userError.message, userId: user.id }
    })
  }

  if (!userData?.current_organization_id) {
    console.log('[Auth] User has no current organization set')
    // Try to get any organization membership
    const { data: anyMembership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .limit(1)
      .single()
    
    if (!anyMembership) {
      throw AuthErrors.noOrganization(user.id)
    }
    
    // Update user's current organization
    await supabase
      .from('users')
      .update({ current_organization_id: anyMembership.organization_id })
      .eq('id', user.id)
    
    userData.current_organization_id = anyMembership.organization_id
  }

  // Get the organization details and user's role
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organization:organizations(*)
    `)
    .eq('user_id', user.id)
    .eq('organization_id', userData.current_organization_id)
    .not('accepted_at', 'is', null)
    .single()

  if (membershipError) {
    console.error('[Auth] Failed to get membership:', membershipError)
    throw AuthErrors.organizationNotFound(userData.current_organization_id)
  }

  if (!membership?.organization) {
    console.error('[Auth] Membership found but organization data missing')
    throw new AuthError({
      code: 'ORGANIZATION_DATA_ERROR' as any,
      message: 'Organization data is incomplete',
      userMessage: 'There was a problem loading your organization. Please try again.',
      technicalDetails: { 
        membershipId: membership?.organization_id,
        userId: user.id 
      }
    })
  }

  return {
    organizationId: membership.organization_id,
    organization: membership.organization,
    role: membership.role
  }
}

// Backward compatible version that returns null instead of throwing
export const getCurrentUserOrganizationSafe = async () => {
  try {
    return await getCurrentUserOrganization()
  } catch (error) {
    console.error('[Auth] getCurrentUserOrganizationSafe error:', error)
    return null
  }
}

// Export alias for compatibility
export { createClient as createServerClient }

// Export non-memoized version for Pages Router
export { _createClient as createServerClientForPages }