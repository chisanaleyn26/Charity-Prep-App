import React from 'react'

/**
 * Enhanced error handling utilities for async operations
 */

export interface AsyncResult<T> {
  data?: T
  error?: string
  success: boolean
}

export interface ErrorContext {
  component?: string
  operation?: string
  userId?: string
  organizationId?: string
  metadata?: Record<string, any>
}

/**
 * Wraps async operations with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<AsyncResult<T>> {
  try {
    const data = await operation()
    return { data, success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    
    // Log error with context
    console.error('Async operation failed:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString()
    })

    // Report to monitoring service if available
    if (typeof window !== 'undefined') {
      reportClientError(error, context)
    }

    return { error: errorMessage, success: false }
  }
}

/**
 * Reports client-side errors to monitoring endpoint
 */
export function reportClientError(error: any, context?: ErrorContext) {
  try {
    const errorReport = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    fetch('/api/monitoring/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(console.error)
  } catch (reportError) {
    console.error('Failed to report error:', reportError)
  }
}

/**
 * Custom hook for handling async operations with error states
 */
export function useAsyncOperation<T>() {
  const [state, setState] = React.useState<{
    data?: T
    error?: string
    loading: boolean
  }>({ loading: false })

  const execute = React.useCallback(async (
    operation: () => Promise<T>,
    context?: ErrorContext
  ) => {
    setState({ loading: true })
    
    const result = await withErrorHandling(operation, context)
    
    setState({
      data: result.data,
      error: result.error,
      loading: false
    })

    return result
  }, [])

  const reset = React.useCallback(() => {
    setState({ loading: false })
  }, [])

  return { ...state, execute, reset }
}

/**
 * Enhanced error boundary for specific error types
 */
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Error handler for specific error types
 */
export function handleTypedError(error: any): string {
  if (error instanceof ValidationError) {
    return `Validation error${error.field ? ` in ${error.field}` : ''}: ${error.message}`
  }
  
  if (error instanceof DatabaseError) {
    return 'Database operation failed. Please try again.'
  }
  
  if (error instanceof NetworkError) {
    if (error.status === 404) return 'Resource not found'
    if (error.status === 403) return 'Access denied'
    if (error.status === 500) return 'Server error. Please try again later.'
    return 'Network error. Please check your connection.'
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please log in to continue'
  }
  
  return error instanceof Error ? error.message : 'An unexpected error occurred'
}

/**
 * Retry utility for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: ErrorContext
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, {
        error: error instanceof Error ? error.message : error,
        context,
        attempt
      })
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw lastError
}