import { NextRequest, NextResponse } from 'next/server'
import { logError } from '@/lib/monitoring/error-tracker'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent')
    const clientIP = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    request.ip

    const errorData = await request.json()
    
    // Validate required fields
    if (!errorData.message || !errorData.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: message, timestamp' },
        { status: 400 }
      )
    }

    // Log the client error
    await logError(new Error(errorData.message), {
      errorType: 'system',
      severity: errorData.severity || 'medium',
      userId: errorData.userId,
      metadata: {
        stack: errorData.stack,
        url: errorData.url,
        userAgent: errorData.userAgent || userAgent,
        clientIP,
        context: errorData.context,
        timestamp: new Date(errorData.timestamp).toISOString(),
        source: 'client'
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to process client error:', error)
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}