import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database.types'

/**
 * Create a Supabase client with service role key for admin operations
 * This bypasses Row Level Security (RLS) policies
 * 
 * ⚠️ IMPORTANT: Only use this in server-side code (API routes, server actions)
 * Never expose the service role key to the client
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for service client')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Create a Supabase admin client alias for compatibility
 */
export const createAdminClient = createServiceClient