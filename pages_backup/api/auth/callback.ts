import { createServerClient } from '@supabase/ssr'
import { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '@/lib/types/database.types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({ name, value: req.cookies[name] || '' }))
        },
        setAll(cookiesToSet) {
          res.setHeader(
            'Set-Cookie',
            cookiesToSet.map(({ name, value, options }) =>
              `${name}=${value}; Path=${options?.path || '/'}; ${
                options?.maxAge ? `Max-Age=${options.maxAge};` : ''
              } ${options?.httpOnly ? 'HttpOnly;' : ''} ${
                options?.sameSite ? `SameSite=${options.sameSite};` : ''
              } ${options?.secure ? 'Secure;' : ''}`
            )
          )
        },
      },
    }
  )

  const code = req.query.code as string

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  res.redirect('/dashboard')
}