import { NextResponse } from 'next/server'

// Get the actual price IDs from environment variables
export async function GET() {
  return NextResponse.json({
    essentials: {
      monthly: process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY,
      yearly: process.env.STRIPE_PRICE_ESSENTIALS_YEARLY
    },
    standard: {
      monthly: process.env.STRIPE_PRICE_STANDARD_MONTHLY,
      yearly: process.env.STRIPE_PRICE_STANDARD_YEARLY
    },
    premium: {
      monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
      yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY
    }
  })
}