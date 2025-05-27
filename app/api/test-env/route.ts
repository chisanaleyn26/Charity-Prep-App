import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    autoLogin: process.env.NEXT_PUBLIC_AUTO_LOGIN,
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    timestamp: new Date().toISOString()
  })
}