import { NextResponse } from 'next/server'
import { runDailyChecks } from '@/lib/api/cron'

export async function POST(request: Request) {
  try {
    // In production, you'd verify this is from your cron service
    // For now, we'll allow manual triggering
    
    const result = await runDailyChecks()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to run daily checks' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to trigger the daily notification checks' 
  })
}