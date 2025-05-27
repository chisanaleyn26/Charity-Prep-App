'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
// import { toast } from 'sonner'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    resetError: () => void
    errorId: string
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate a unique error ID for tracking
    const errorId = Math.random().toString(36).substring(2, 15)
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
      errorId: this.state.errorId || Math.random().toString(36).substring(2, 15)
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Report to monitoring service (if configured)
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // This would typically send to a service like Sentry, LogRocket, etc.
    try {
      // You could integrate with your monitoring service here
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : ''
      }
      
      // Send to monitoring endpoint
      if (typeof window !== 'undefined') {
        fetch('/api/monitoring/client-errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport)
        }).catch(console.error)
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString()
    }
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => console.log('Error details copied to clipboard'))
      .catch(() => console.error('Failed to copy error details'))
  }

  private goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
            errorId={this.state.errorId}
          />
        )
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription>
                We apologize for the inconvenience. An unexpected error has occurred.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.props.showDetails && this.state.error && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Error Details:</p>
                  <p className="text-xs text-gray-600 font-mono break-words">
                    {this.state.error.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.resetError}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.goHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {this.props.showDetails && (
                <Button
                  onClick={this.copyErrorDetails}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Copy Error Details
                </Button>
              )}

              <p className="text-xs text-gray-500 text-center">
                If this problem persists, please contact support with error ID: {this.state.errorId}
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to reset errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    console.error('Error handled by useErrorHandler:', error)
  }, [])

  // Reset error when component unmounts
  React.useEffect(() => {
    return () => setError(null)
  }, [])

  if (error) {
    throw error // This will be caught by the nearest ErrorBoundary
  }

  return { handleError, resetError }
}

// Form-specific error boundary
export const FormErrorBoundary: React.FC<{
  children: React.ReactNode
  onError?: (error: Error) => void
}> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        onError?.(error)
        console.error('Form error: ' + error.message)
      }}
      fallback={({ error, resetError, errorId }) => (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Form Error</h3>
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            </div>
            <Button
              onClick={resetError}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Form
            </Button>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Page-level error boundary
export const PageErrorBoundary: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // You could send this to your analytics/monitoring service
        console.error('Page error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary