import { NextResponse } from 'next/server'

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  
  // Get all env vars that contain 'STRIPE'
  const stripeEnvVars = Object.keys(process.env)
    .filter(key => key.includes('STRIPE'))
    .reduce((acc, key) => {
      const value = process.env[key]
      acc[key] = value ? `${value.substring(0, 10)}... (${value.length} chars)` : 'undefined'
      return acc
    }, {} as Record<string, string>)
  
  return NextResponse.json({
    hasSecretKey: !!stripeKey,
    secretKeyStart: stripeKey ? stripeKey.substring(0, 20) + '...' : 'undefined',
    secretKeyLength: stripeKey ? stripeKey.length : 0,
    secretKeyLast10: stripeKey ? '...' + stripeKey.substring(stripeKey.length - 10) : 'undefined',
    hasPublicKey: !!publicKey,
    publicKeyStart: publicKey ? publicKey.substring(0, 10) + '...' : 'undefined',
    nodeEnv: process.env.NODE_ENV,
    stripeEnvVars,
    timestamp: new Date().toISOString()
  })
}