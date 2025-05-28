'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-mist-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6">
            <h1 className="text-8xl font-bold bg-gradient-to-r from-inchworm to-sage-600 bg-clip-text text-transparent">
              404
            </h1>
          </div>
          <CardTitle className="text-3xl font-bold text-gunmetal mb-2">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">
              This might happen if you:
            </p>
            <ul className="text-sm space-y-1 text-left inline-block">
              <li>• Typed the URL incorrectly</li>
              <li>• Clicked on a broken link</li>
              <li>• The page was moved or deleted</li>
              <li>• You don&apos;t have permission to access this page</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              asChild
              className="flex-1 bg-inchworm text-gunmetal hover:bg-inchworm/90"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              className="flex-1"
            >
              <Link href="/search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Link>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="w-full text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Need help? {' '}
            <Link 
              href="/contact" 
              className="text-inchworm hover:underline font-medium"
            >
              Contact our support team
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}