import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url?: string
  userId?: string
  additionalData?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent')
    const clientIP = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    request.ip

    const data = await request.json()
    
    // Handle both single metric and array of metrics
    const metrics: PerformanceMetric[] = Array.isArray(data) ? data : [data]
    
    // Validate metrics
    for (const metric of metrics) {
      if (!metric.name || typeof metric.value !== 'number' || !metric.timestamp) {
        return NextResponse.json(
          { error: 'Invalid metric data: name, value, and timestamp are required' },
          { status: 400 }
        )
      }
    }

    const supabase = await createClient()
    
    // Process and store metrics
    const performanceRecords = metrics.map(metric => ({
      metric_name: metric.name,
      metric_value: metric.value,
      url: metric.url,
      user_id: metric.userId,
      user_agent: userAgent,
      client_ip: clientIP,
      additional_data: metric.additionalData || {},
      recorded_at: new Date(metric.timestamp).toISOString()
    }))

    const { error } = await supabase
      .from('performance_metrics')
      .insert(performanceRecords)

    if (error) {
      console.error('Database error storing performance metrics:', error)
      return NextResponse.json(
        { error: 'Failed to store performance metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      processed: metrics.length 
    })

  } catch (error) {
    console.error('Failed to process performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to process performance data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const userId = searchParams.get('userId')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
    
    if (metric) {
      query = query.eq('metric_name', metric)
    }
    
    if (startDate) {
      query = query.gte('recorded_at', new Date(startDate).toISOString())
    }
    
    if (endDate) {
      query = query.lte('recorded_at', new Date(endDate).toISOString())
    }
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    // Limit to prevent large responses
    query = query.limit(1000)
    
    const { data, error } = await query
    
    if (error) {
      console.error('Database error fetching performance metrics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch performance metrics' },
        { status: 500 }
      )
    }

    // Calculate aggregates for the requested metrics
    const aggregates = calculateAggregates(data || [])
    
    return NextResponse.json({
      metrics: data,
      aggregates,
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Failed to fetch performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}

function calculateAggregates(metrics: any[]) {
  const byMetric: Record<string, number[]> = {}
  
  metrics.forEach(metric => {
    if (!byMetric[metric.metric_name]) {
      byMetric[metric.metric_name] = []
    }
    byMetric[metric.metric_name].push(metric.metric_value)
  })
  
  const aggregates: Record<string, {
    count: number
    average: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  }> = {}
  
  Object.entries(byMetric).forEach(([metricName, values]) => {
    const sorted = values.sort((a, b) => a - b)
    const count = values.length
    const sum = values.reduce((a, b) => a + b, 0)
    
    aggregates[metricName] = {
      count,
      average: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    }
  })
  
  return aggregates
}