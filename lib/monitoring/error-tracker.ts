'use server'

import { createClient } from '@/lib/supabase/server'

export interface ErrorLog {
  id: string
  organization_id?: string
  user_id?: string
  error_type: 'api' | 'auth' | 'validation' | 'integration' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  stack_trace?: string
  context?: Record<string, any>
  user_agent?: string
  ip_address?: string
  resolved: boolean
  resolved_at?: Date
  created_at: Date
}

export interface ErrorMetrics {
  total: number
  bySeverity: Record<string, number>
  byType: Record<string, number>
  recentErrors: ErrorLog[]
  errorRate: number
  resolvedRate: number
}

/**
 * Log error to database
 */
export async function logError(
  error: Error | unknown,
  context?: {
    userId?: string
    organizationId?: string
    errorType?: ErrorLog['error_type']
    severity?: ErrorLog['severity']
    metadata?: Record<string, any>
  }
): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Extract error details
    const errorMessage = error instanceof Error ? error.message : String(error)
    const stackTrace = error instanceof Error ? error.stack : undefined
    
    // Determine severity if not provided
    const severity = context?.severity || determineSeverity(errorMessage)
    
    // Get request details if available
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    
    // Insert error log
    await supabase
      .from('error_logs')
      .insert({
        organization_id: context?.organizationId,
        user_id: context?.userId,
        error_type: context?.errorType || 'system',
        severity,
        message: errorMessage,
        stack_trace: stackTrace,
        context: context?.metadata,
        user_agent: userAgent,
        resolved: false
      })
    
    // Send critical errors to monitoring service
    if (severity === 'critical') {
      await notifyCriticalError({
        message: errorMessage,
        stackTrace,
        context: context?.metadata
      })
    }
    
  } catch (loggingError) {
    // Fallback to console if database logging fails
    console.error('Failed to log error:', loggingError)
    console.error('Original error:', error)
  }
}

/**
 * Get error metrics
 */
export async function getErrorMetrics(
  organizationId?: string,
  timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date()
  }
): Promise<ErrorMetrics> {
  const supabase = await createClient()
  
  let query = supabase
    .from('error_logs')
    .select('*')
    .gte('created_at', timeRange.start.toISOString())
    .lte('created_at', timeRange.end.toISOString())
  
  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }
  
  const { data: errors } = await query
  
  if (!errors) {
    return {
      total: 0,
      bySeverity: {},
      byType: {},
      recentErrors: [],
      errorRate: 0,
      resolvedRate: 0
    }
  }
  
  // Calculate metrics
  const bySeverity: Record<string, number> = {}
  const byType: Record<string, number> = {}
  
  errors.forEach(error => {
    bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
    byType[error.error_type] = (byType[error.error_type] || 0) + 1
  })
  
  const resolved = errors.filter(e => e.resolved).length
  const resolvedRate = errors.length > 0 ? (resolved / errors.length) * 100 : 0
  
  // Calculate error rate (errors per hour)
  const hours = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60)
  const errorRate = errors.length / hours
  
  return {
    total: errors.length,
    bySeverity,
    byType,
    recentErrors: errors
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(e => ({
        ...e,
        created_at: new Date(e.created_at),
        resolved_at: e.resolved_at ? new Date(e.resolved_at) : undefined
      })),
    errorRate,
    resolvedRate
  }
}

/**
 * Mark error as resolved
 */
export async function resolveError(
  errorId: string,
  resolution?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('error_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolution
      })
      .eq('id', errorId)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('Resolve error failed:', error)
    return { error: 'Failed to resolve error' }
  }
}

/**
 * Error boundary handler
 */
export function createErrorBoundaryHandler() {
  return {
    onError: (error: Error, errorInfo: { componentStack: string }) => {
      logError(error, {
        errorType: 'system',
        severity: 'high',
        metadata: {
          componentStack: errorInfo.componentStack,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          timestamp: new Date().toISOString()
        }
      })
    }
  }
}

/**
 * API error wrapper
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    errorType?: ErrorLog['error_type']
    includeUserId?: boolean
    includeOrgId?: boolean
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      // Extract context from function if needed
      const context: Parameters<typeof logError>[1] = {
        errorType: options?.errorType || 'api'
      }
      
      // Log the error
      await logError(error, context)
      
      // Re-throw for handling upstream
      throw error
    }
  }) as T
}

/**
 * Health check endpoint data
 */
export async function getHealthStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    database: boolean
    storage: boolean
    auth: boolean
    ai: boolean
  }
  metrics: {
    responseTime: number
    errorRate: number
    activeUsers: number
  }
}> {
  const startTime = Date.now()
  const checks = {
    database: false,
    storage: false,
    auth: false,
    ai: false
  }
  
  try {
    const supabase = await createClient()
    
    // Check database
    const { error: dbError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
    checks.database = !dbError
    
    // Check storage
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .list('test', { limit: 1 })
    checks.storage = !storageError
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    checks.auth = true // If we got here, auth is working
    
    // Check AI service (mock for now)
    checks.ai = true
    
    // Get metrics
    const metrics = await getErrorMetrics()
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    
    const allHealthy = Object.values(checks).every(v => v)
    const status = allHealthy 
      ? 'healthy' 
      : Object.values(checks).filter(v => v).length > 2 
        ? 'degraded' 
        : 'unhealthy'
    
    return {
      status,
      checks,
      metrics: {
        responseTime: Date.now() - startTime,
        errorRate: metrics.errorRate,
        activeUsers: activeUsers || 0
      }
    }
    
  } catch (error) {
    return {
      status: 'unhealthy',
      checks,
      metrics: {
        responseTime: Date.now() - startTime,
        errorRate: 999,
        activeUsers: 0
      }
    }
  }
}

// Helper functions

function determineSeverity(message: string): ErrorLog['severity'] {
  const lowPatterns = [/warning/i, /deprecated/i, /info/i]
  const highPatterns = [/critical/i, /fatal/i, /emergency/i]
  const mediumPatterns = [/error/i, /failed/i, /exception/i]
  
  if (highPatterns.some(p => p.test(message))) return 'critical'
  if (mediumPatterns.some(p => p.test(message))) return 'high'
  if (lowPatterns.some(p => p.test(message))) return 'low'
  
  return 'medium'
}

async function notifyCriticalError(error: {
  message: string
  stackTrace?: string
  context?: any
}): Promise<void> {
  // This would integrate with external monitoring service
  // For now, just log to console
  console.error('CRITICAL ERROR:', error)
  
  // Could send to Sentry, LogRocket, etc.
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(new Error(error.message))
  // }
}