/**
 * Client-side performance monitoring utilities
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

class ClientPerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: Map<string, PerformanceObserver> = new Map()

  // Core Web Vitals monitoring
  initializeWebVitals() {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    this.observeLCP()
    
    // First Input Delay (FID)
    this.observeFID()
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS()
    
    // Time to First Byte (TTFB)
    this.measureTTFB()
    
    // First Contentful Paint (FCP)
    this.observeFCP()
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime)
      })
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.set('lcp', observer)
    } catch (e) {
      console.warn('LCP observation not supported')
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0] as any
        this.recordMetric('FID', firstInput.processingStart - firstInput.startTime)
      })
      
      observer.observe({ type: 'first-input', buffered: true })
      this.observers.set('fid', observer)
    } catch (e) {
      console.warn('FID observation not supported')
    }
  }

  private observeCLS() {
    let clsValue = 0
    let clsEntries: any[] = []

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            clsEntries.push(entry)
          }
        }
      })
      
      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.set('cls', observer)
      
      // Report CLS when page is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.recordMetric('CLS', clsValue, { entries: clsEntries.length })
        }
      })
    } catch (e) {
      console.warn('CLS observation not supported')
    }
  }

  private measureTTFB() {
    if ('performance' in window && 'timing' in window.performance) {
      const timing = window.performance.timing
      const ttfb = timing.responseStart - timing.navigationStart
      this.recordMetric('TTFB', ttfb)
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const fcpEntry = list.getEntries().find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          this.recordMetric('FCP', fcpEntry.startTime)
        }
      })
      
      observer.observe({ type: 'paint', buffered: true })
      this.observers.set('fcp', observer)
    } catch (e) {
      console.warn('FCP observation not supported')
    }
  }

  // Custom performance marks
  mark(name: string) {
    if ('performance' in window && 'mark' in window.performance) {
      window.performance.mark(name)
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if ('performance' in window && 'measure' in window.performance) {
      try {
        const measure = window.performance.measure(name, startMark, endMark)
        this.recordMetric(name, measure.duration)
        return measure.duration
      } catch (e) {
        console.warn(`Failed to measure ${name}`)
      }
    }
    return null
  }

  // Record a custom metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }
    
    this.metrics.push(metric)
    
    // Send to monitoring service if configured
    this.reportMetric(metric)
  }

  // Report metrics to monitoring endpoint
  private reportMetric(metric: PerformanceMetric) {
    // Batch metrics for efficiency
    if (this.metrics.length >= 10 || metric.name === 'CLS') {
      this.flushMetrics()
    }
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return
    
    const metricsToSend = [...this.metrics]
    this.metrics = []
    
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: metricsToSend,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      })
    } catch (e) {
      console.error('Failed to report performance metrics')
      // Re-add metrics to queue
      this.metrics.unshift(...metricsToSend)
    }
  }

  // Get performance summary
  getSummary() {
    return {
      metrics: this.metrics,
      vitals: {
        lcp: this.metrics.find(m => m.name === 'LCP')?.value,
        fid: this.metrics.find(m => m.name === 'FID')?.value,
        cls: this.metrics.find(m => m.name === 'CLS')?.value,
        ttfb: this.metrics.find(m => m.name === 'TTFB')?.value,
        fcp: this.metrics.find(m => m.name === 'FCP')?.value
      }
    }
  }

  // Cleanup
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.flushMetrics()
  }
}

// Singleton instance
export const clientPerformanceMonitor = new ClientPerformanceMonitor()

// React hook for performance monitoring
import { useEffect, useRef } from 'react'

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const mountTime = useRef(0)
  
  useEffect(() => {
    // Track mount time
    mountTime.current = performance.now()
    clientPerformanceMonitor.mark(`${componentName}-mount`)
    
    // Track render count
    renderCount.current++
    
    return () => {
      // Measure component lifetime
      const lifetime = performance.now() - mountTime.current
      const finalRenderCount = renderCount.current
      clientPerformanceMonitor.recordMetric(`${componentName}-lifetime`, lifetime, {
        renders: finalRenderCount
      })
    }
  }, [componentName])
  
  // Track renders
  useEffect(() => {
    if (renderCount.current > 1) {
      clientPerformanceMonitor.recordMetric(`${componentName}-rerender`, renderCount.current)
    }
  })
}

// Utility to measure async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await operation()
    const duration = performance.now() - start
    clientPerformanceMonitor.recordMetric(`async-${name}`, duration)
    return result
  } catch (error) {
    const duration = performance.now() - start
    clientPerformanceMonitor.recordMetric(`async-${name}-error`, duration)
    throw error
  }
}

// Resource loading performance
export function measureResourceLoading() {
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    // Group by resource type
    const grouped = resources.reduce((acc, resource) => {
      const type = resource.initiatorType || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0
      })
      return acc
    }, {} as Record<string, any[]>)
    
    // Report slow resources
    resources.forEach(resource => {
      if (resource.duration > 1000) {
        clientPerformanceMonitor.recordMetric('slow-resource', resource.duration, {
          name: resource.name,
          type: resource.initiatorType,
          size: resource.transferSize
        })
      }
    })
    
    return grouped
  }
  
  return null
}