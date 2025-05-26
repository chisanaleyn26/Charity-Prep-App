'use server'

import { createClient } from '@/lib/supabase/server'

export interface PerformanceMetric {
  id: string
  organization_id?: string
  user_id?: string
  metric_type: 'api_request' | 'db_query' | 'ai_request' | 'file_operation' | 'render'
  operation: string
  duration_ms: number
  success: boolean
  metadata?: Record<string, any>
  created_at: Date
}

export interface PerformanceReport {
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  slowestOperations: Array<{
    operation: string
    avgDuration: number
    count: number
  }>
  operationBreakdown: Record<string, {
    count: number
    avgDuration: number
    successRate: number
  }>
  timeSeriesData: Array<{
    timestamp: Date
    avgDuration: number
    requestCount: number
  }>
}

/**
 * Track performance metric
 */
export async function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  options?: {
    metricType?: PerformanceMetric['metric_type']
    userId?: string
    organizationId?: string
    metadata?: Record<string, any>
  }
): Promise<T> {
  const startTime = performance.now()
  let success = false
  let result: T
  
  try {
    result = await fn()
    success = true
    return result
  } finally {
    const duration = performance.now() - startTime
    
    // Log to database asynchronously
    logPerformanceMetric({
      metric_type: options?.metricType || 'api_request',
      operation,
      duration_ms: Math.round(duration),
      success,
      user_id: options?.userId,
      organization_id: options?.organizationId,
      metadata: options?.metadata
    }).catch(console.error)
  }
}

/**
 * Log performance metric
 */
async function logPerformanceMetric(
  metric: Omit<PerformanceMetric, 'id' | 'created_at'>
): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Only log if above threshold to reduce noise
    const thresholds: Record<PerformanceMetric['metric_type'], number> = {
      api_request: 100,      // 100ms
      db_query: 50,          // 50ms
      ai_request: 1000,      // 1s
      file_operation: 200,   // 200ms
      render: 16             // 16ms (60fps)
    }
    
    if (metric.duration_ms < thresholds[metric.metric_type]) {
      return
    }
    
    await supabase
      .from('performance_metrics')
      .insert(metric)
      
  } catch (error) {
    // Don't let performance tracking break the app
    console.error('Failed to log performance metric:', error)
  }
}

/**
 * Get performance report
 */
export async function getPerformanceReport(
  options?: {
    organizationId?: string
    timeRange?: { start: Date; end: Date }
    metricType?: PerformanceMetric['metric_type']
  }
): Promise<PerformanceReport> {
  const supabase = await createClient()
  
  const timeRange = options?.timeRange || {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date()
  }
  
  let query = supabase
    .from('performance_metrics')
    .select('*')
    .gte('created_at', timeRange.start.toISOString())
    .lte('created_at', timeRange.end.toISOString())
  
  if (options?.organizationId) {
    query = query.eq('organization_id', options.organizationId)
  }
  
  if (options?.metricType) {
    query = query.eq('metric_type', options.metricType)
  }
  
  const { data: metrics } = await query
  
  if (!metrics || metrics.length === 0) {
    return {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      slowestOperations: [],
      operationBreakdown: {},
      timeSeriesData: []
    }
  }
  
  // Calculate percentiles
  const durations = metrics.map(m => m.duration_ms).sort((a, b) => a - b)
  const p95Index = Math.floor(durations.length * 0.95)
  const p99Index = Math.floor(durations.length * 0.99)
  
  // Group by operation
  const operationGroups: Record<string, PerformanceMetric[]> = {}
  metrics.forEach(metric => {
    if (!operationGroups[metric.operation]) {
      operationGroups[metric.operation] = []
    }
    operationGroups[metric.operation].push(metric)
  })
  
  // Calculate operation breakdown
  const operationBreakdown: Record<string, any> = {}
  const slowestOps: Array<{ operation: string; avgDuration: number; count: number }> = []
  
  Object.entries(operationGroups).forEach(([operation, opMetrics]) => {
    const totalDuration = opMetrics.reduce((sum, m) => sum + m.duration_ms, 0)
    const successCount = opMetrics.filter(m => m.success).length
    
    operationBreakdown[operation] = {
      count: opMetrics.length,
      avgDuration: Math.round(totalDuration / opMetrics.length),
      successRate: (successCount / opMetrics.length) * 100
    }
    
    slowestOps.push({
      operation,
      avgDuration: Math.round(totalDuration / opMetrics.length),
      count: opMetrics.length
    })
  })
  
  // Sort slowest operations
  slowestOps.sort((a, b) => b.avgDuration - a.avgDuration)
  
  // Generate time series data (hourly buckets)
  const hourlyBuckets: Record<string, PerformanceMetric[]> = {}
  metrics.forEach(metric => {
    const hour = new Date(metric.created_at)
    hour.setMinutes(0, 0, 0)
    const key = hour.toISOString()
    
    if (!hourlyBuckets[key]) {
      hourlyBuckets[key] = []
    }
    hourlyBuckets[key].push(metric)
  })
  
  const timeSeriesData = Object.entries(hourlyBuckets)
    .map(([timestamp, bucketMetrics]) => ({
      timestamp: new Date(timestamp),
      avgDuration: Math.round(
        bucketMetrics.reduce((sum, m) => sum + m.duration_ms, 0) / bucketMetrics.length
      ),
      requestCount: bucketMetrics.length
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  
  return {
    avgResponseTime: Math.round(
      metrics.reduce((sum, m) => sum + m.duration_ms, 0) / metrics.length
    ),
    p95ResponseTime: durations[p95Index] || 0,
    p99ResponseTime: durations[p99Index] || 0,
    slowestOperations: slowestOps.slice(0, 10),
    operationBreakdown,
    timeSeriesData
  }
}

/**
 * Database query optimizer suggestions
 */
export async function getDatabaseOptimizations(): Promise<{
  slowQueries: Array<{
    query: string
    avgDuration: number
    count: number
    suggestion: string
  }>
  missingIndexes: Array<{
    table: string
    columns: string[]
    reason: string
  }>
}> {
  const supabase = await createClient()
  
  // Get slow database queries
  const { data: slowQueries } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('metric_type', 'db_query')
    .gte('duration_ms', 100) // Queries over 100ms
    .order('duration_ms', { ascending: false })
    .limit(20)
  
  const suggestions: Array<any> = []
  
  if (slowQueries) {
    // Group similar queries
    const queryPatterns: Record<string, { queries: any[]; totalDuration: number }> = {}
    
    slowQueries.forEach(metric => {
      const pattern = metric.operation.replace(/\d+/g, '?') // Replace numbers with ?
      if (!queryPatterns[pattern]) {
        queryPatterns[pattern] = { queries: [], totalDuration: 0 }
      }
      queryPatterns[pattern].queries.push(metric)
      queryPatterns[pattern].totalDuration += metric.duration_ms
    })
    
    // Generate suggestions
    Object.entries(queryPatterns).forEach(([pattern, data]) => {
      const avgDuration = data.totalDuration / data.queries.length
      let suggestion = ''
      
      if (pattern.includes('SELECT *')) {
        suggestion = 'Avoid SELECT *, specify only needed columns'
      } else if (pattern.includes('JOIN') && avgDuration > 200) {
        suggestion = 'Consider adding indexes on JOIN columns'
      } else if (pattern.includes('ORDER BY') && avgDuration > 150) {
        suggestion = 'Add index on ORDER BY columns'
      } else if (data.queries.length > 10) {
        suggestion = 'Consider caching this frequently used query'
      }
      
      suggestions.push({
        query: pattern,
        avgDuration: Math.round(avgDuration),
        count: data.queries.length,
        suggestion
      })
    })
  }
  
  // Analyze for missing indexes (simplified)
  const missingIndexes = [
    {
      table: 'safeguarding_records',
      columns: ['organization_id', 'expiry_date'],
      reason: 'Frequent queries filtering by organization and expiry'
    },
    {
      table: 'overseas_activities',
      columns: ['organization_id', 'activity_date'],
      reason: 'Date range queries for activity reports'
    },
    {
      table: 'income_records',
      columns: ['organization_id', 'date_received'],
      reason: 'Financial reporting date ranges'
    }
  ]
  
  return {
    slowQueries: suggestions.slice(0, 10),
    missingIndexes
  }
}

/**
 * Client-side performance tracking
 */
export function createClientPerformanceTracker() {
  if (typeof window === 'undefined') return null
  
  return {
    trackPageLoad: () => {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (perfData) {
          logPerformanceMetric({
            metric_type: 'render',
            operation: 'page_load',
            duration_ms: Math.round(perfData.loadEventEnd - perfData.fetchStart),
            success: true,
            metadata: {
              domReady: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
              firstPaint: Math.round(perfData.responseEnd - perfData.fetchStart),
              url: window.location.pathname
            }
          })
        }
      })
    },
    
    trackApiCall: (url: string, duration: number, success: boolean) => {
      logPerformanceMetric({
        metric_type: 'api_request',
        operation: url,
        duration_ms: Math.round(duration),
        success,
        metadata: {
          method: 'GET', // Would be dynamic in real implementation
          userAgent: navigator.userAgent
        }
      })
    }
  }
}

/**
 * Cache manager for performance
 */
export class CacheManager {
  private static cache = new Map<string, { data: any; expiry: number }>()
  
  static set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    })
  }
  
  static get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  static clear(): void {
    this.cache.clear()
  }
  
  static prune(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}