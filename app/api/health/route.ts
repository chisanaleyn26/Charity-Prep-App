import { NextResponse } from 'next/server'
import { getHealthStatus } from '@/lib/monitoring/error-tracker'

export async function GET() {
  try {
    const health = await getHealthStatus()
    
    // Return appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 
                     : health.status === 'degraded' ? 200 
                     : 503
    
    return NextResponse.json(health, { status: statusCode })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check service failed',
      checks: {
        database: false,
        storage: false,
        auth: false,
        ai: false
      },
      metrics: {
        responseTime: 0,
        errorRate: 999,
        activeUsers: 0
      }
    }, { status: 503 })
  }
}

// Simple ping endpoint for basic uptime monitoring
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}