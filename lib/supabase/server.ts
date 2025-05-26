import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'
import type { NextApiRequest, NextApiResponse } from 'next'

export function createClient(req?: NextApiRequest, res?: NextApiResponse) {
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