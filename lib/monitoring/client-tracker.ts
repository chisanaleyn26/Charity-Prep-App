'use client'

// Client-side error tracking and performance monitoring

interface ClientErrorInfo {
  message: string
  stack?: string
  errorBoundary?: string
  componentStack?: string
  userId?: string
  userAgent?: string
  url?: string
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url?: string
  userId?: string
  additionalData?: Record<string, any>
}

class ClientErrorTracker {
  private apiEndpoint: string
  private isEnabled: boolean
  private userId?: string
  private sessionId: string
  private errorQueue: ClientErrorInfo[] = []
  private performanceQueue: PerformanceMetric[] = []

  constructor() {
    this.apiEndpoint = '/api/monitoring/client-errors'
    this.isEnabled = process.env.NODE_ENV === 'production'
    this.sessionId = this.generateSessionId()
    
    // Batch send errors every 5 seconds
    if (typeof window !== 'undefined') {
      setInterval(() => this.flushQueues(), 5000)
      
      // Send on page unload
      window.addEventListener('beforeunload', () => this.flushQueues())
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  async captureException(error: Error, context?: Record<string, any>, severity: ClientErrorInfo['severity'] = 'medium') {
    if (typeof window === 'undefined') return

    const errorInfo: ClientErrorInfo = {
      message: error.message,
      stack: error.stack,
      userId: this.userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      severity,
      context: {
        sessionId: this.sessionId,
        ...context
      }
    }

    if (this.isEnabled) {
      this.errorQueue.push(errorInfo)
      
      // Send immediately for critical errors
      if (severity === 'critical') {
        await this.sendError(errorInfo)
      }
    } else {
      console.error('Error captured:', error, context)
    }
  }

  async captureMessage(message: string, severity: ClientErrorInfo['severity'] = 'low', context?: Record<string, any>) {
    const error = new Error(message)
    return this.captureException(error, context, severity)
  }

  async capturePerformanceMetric(metric: Omit<PerformanceMetric, 'timestamp' | 'userId'>) {
    if (typeof window === 'undefined') return

    const performanceData: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
      userId: this.userId,
      url: window.location.href
    }

    if (this.isEnabled) {
      this.performanceQueue.push(performanceData)
    }
  }

  private async sendError(errorInfo: ClientErrorInfo) {
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      })
    } catch (e) {
      console.error('Failed to send error to monitoring service:', e)
    }
  }

  private async sendPerformanceData(metrics: PerformanceMetric[]) {
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      })
    } catch (e) {
      console.error('Failed to send performance metrics:', e)
    }
  }

  private async flushQueues() {
    if (this.errorQueue.length > 0) {
      const errors = [...this.errorQueue]
      this.errorQueue = []
      
      for (const error of errors) {
        await this.sendError(error)
      }
    }

    if (this.performanceQueue.length > 0) {
      const metrics = [...this.performanceQueue]
      this.performanceQueue = []
      await this.sendPerformanceData(metrics)
    }
  }

  // Setup global error handling
  setupGlobalErrorHandling() {
    if (typeof window === 'undefined') return

    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled_error'
      }, 'high')
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      this.captureException(error, {
        type: 'unhandled_promise_rejection'
      }, 'high')
    })

    // Network errors (monkey patch fetch)
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      
      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        
        // Track response time
        this.capturePerformanceMetric({
          name: 'api_response_time',
          value: endTime - startTime,
          additionalData: {
            url: args[0],
            status: response.status,
            ok: response.ok
          }
        })
        
        if (!response.ok) {
          this.captureMessage(`API error: ${response.status} ${response.statusText}`, 'medium', {
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            type: 'api_error'
          })
        }
        
        return response
      } catch (error) {
        const endTime = performance.now()
        
        this.capturePerformanceMetric({
          name: 'api_response_time',
          value: endTime - startTime,
          additionalData: {
            url: args[0],
            error: true
          }
        })
        
        this.captureException(error as Error, {
          url: args[0],
          type: 'fetch_error'
        }, 'medium')
        throw error
      }
    }
  }

  // Performance monitoring
  setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return

    // Page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          this.capturePerformanceMetric({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.fetchStart
          })

          this.capturePerformanceMetric({
            name: 'dom_content_loaded',
            value: navigation.domContentLoadedEventEnd - navigation.fetchStart
          })

          this.capturePerformanceMetric({
            name: 'first_byte_time',
            value: navigation.responseStart - navigation.fetchStart
          })

          this.capturePerformanceMetric({
            name: 'dom_interactive',
            value: navigation.domInteractive - navigation.fetchStart
          })
        }

        // Memory usage
        if ('memory' in performance) {
          const memory = (performance as any).memory
          this.capturePerformanceMetric({
            name: 'memory_usage',
            value: memory.usedJSHeapSize,
            additionalData: {
              totalHeapSize: memory.totalJSHeapSize,
              heapSizeLimit: memory.jsHeapSizeLimit
            }
          })
        }
      }, 0)
    })

    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            this.capturePerformanceMetric({
              name: 'largest_contentful_paint',
              value: lastEntry.startTime
            })
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true })

        // First Input Delay
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.capturePerformanceMetric({
              name: 'first_input_delay',
              value: entry.processingStart - entry.startTime
            })
          }
        }).observe({ type: 'first-input', buffered: true })

        // Cumulative Layout Shift
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.capturePerformanceMetric({
            name: 'cumulative_layout_shift',
            value: clsValue
          })
        }).observe({ type: 'layout-shift', buffered: true })

        // Long Tasks
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.capturePerformanceMetric({
              name: 'long_task',
              value: entry.duration,
              additionalData: {
                startTime: entry.startTime
              }
            })
          }
        }).observe({ entryTypes: ['longtask'] })

      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error)
      }
    }

    // Connection information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.capturePerformanceMetric({
        name: 'connection_type',
        value: 1,
        additionalData: {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        }
      })
    }
  }

  // User interaction tracking
  trackUserAction(action: string, data?: Record<string, any>) {
    if (!this.isEnabled) return

    this.captureMessage(`User action: ${action}`, 'low', {
      type: 'user_action',
      action,
      ...data
    })
  }

  // Business metric tracking
  trackBusinessEvent(event: string, value?: number, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    this.capturePerformanceMetric({
      name: `business_event_${event}`,
      value: value || 1,
      additionalData: properties
    })
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>) {
    this.trackUserAction(`feature_${feature}_${action}`, metadata)
  }

  // Page view tracking
  trackPageView(page: string, metadata?: Record<string, any>) {
    this.capturePerformanceMetric({
      name: 'page_view',
      value: 1,
      additionalData: {
        page,
        referrer: document.referrer,
        ...metadata
      }
    })
  }

  // Form interaction tracking
  trackFormInteraction(formName: string, action: 'start' | 'complete' | 'abandon', metadata?: Record<string, any>) {
    this.trackUserAction(`form_${formName}_${action}`, metadata)
  }

  // Search tracking
  trackSearch(query: string, resultsCount: number, metadata?: Record<string, any>) {
    this.trackUserAction('search', {
      query: query.substring(0, 100), // Limit query length for privacy
      resultsCount,
      ...metadata
    })
  }

  // Error reporting by users
  reportIssue(description: string, category: string, metadata?: Record<string, any>) {
    this.captureMessage(`User reported issue: ${description}`, 'medium', {
      type: 'user_report',
      category,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metadata
    })
  }
}

// Create singleton instance
export const clientErrorTracker = new ClientErrorTracker()

// React Error Boundary helper
export class ErrorBoundary extends Error {
  constructor(message: string, public componentStack?: string) {
    super(message)
    this.name = 'ErrorBoundary'
  }
}

// Utility functions for common error patterns
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          clientErrorTracker.captureException(error, {
            function: fn.name,
            args: args.map(arg => typeof arg === 'object' ? '[Object]' : arg),
            ...context
          })
          throw error
        })
      }
      
      return result
    } catch (error) {
      clientErrorTracker.captureException(error as Error, {
        function: fn.name,
        args: args.map(arg => typeof arg === 'object' ? '[Object]' : arg),
        ...context
      })
      throw error
    }
  }) as T
}

// Initialize error tracking when module loads
if (typeof window !== 'undefined') {
  clientErrorTracker.setupGlobalErrorHandling()
  clientErrorTracker.setupPerformanceMonitoring()
  
  // Track initial page view
  clientErrorTracker.trackPageView(window.location.pathname)
}