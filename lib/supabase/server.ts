import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'
import type { NextApiRequest, NextApiResponse } from 'next'

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

// Helper to get current organization
export const getCurrentUserOrganization = async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const { data: membership } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organization:organizations(*)
    `)
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!membership) {
    throw new Error('User is not a member of any organization')
  }

  return {
    organizationId: membership.organization_id,
    organization: membership.organization,
    role: membership.role
  }
}

// Export alias for compatibility
export { createClient as createServerClient }

// Export non-memoized version for Pages Router
export { _createClient as createServerClientForPages }