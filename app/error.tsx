'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Link } from '@/components/ui/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
    
    // You could send to Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error)
    }
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-mist-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gunmetal">
            Something went wrong!
          </CardTitle>
          <CardDescription className="text-base">
            We&apos;re sorry, but something unexpected happened. 
            Our team has been notified and is working on a fix.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isDevelopment && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Development Error Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-red-700 font-mono bg-red-100 p-2 rounded overflow-auto max-h-32">
                  {error.message}
                  {error.digest && (
                    <div className="mt-2 text-red-600">
                      Error ID: {error.digest}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={reset}
              className="w-full bg-inchworm text-gunmetal hover:bg-inchworm/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              className="w-full"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            If this problem persists, please{' '}
            <Link 
              href="/contact" 
              className="text-inchworm hover:underline font-medium"
            >
              contact support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}