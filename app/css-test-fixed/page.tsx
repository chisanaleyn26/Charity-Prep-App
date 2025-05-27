'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X, AlertCircle, Info } from 'lucide-react'

export default function CSSTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">CSS Test Page</h1>
          <p className="text-lg text-muted-foreground">Testing Tailwind CSS and component styling</p>
        </div>

        {/* Basic Colors Test */}
        <Card>
          <CardHeader>
            <CardTitle>Color System Test</CardTitle>
            <CardDescription>Testing CSS custom properties and color variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-primary rounded border"></div>
                <p className="text-sm text-center">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-secondary rounded border"></div>
                <p className="text-sm text-center">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-muted rounded border"></div>
                <p className="text-sm text-center">Muted</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-accent rounded border"></div>
                <p className="text-sm text-center">Accent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Test */}
        <Card>
          <CardHeader>
            <CardTitle>Typography Test</CardTitle>
            <CardDescription>Testing font loading and text styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <h3 className="text-2xl font-medium">Heading 3</h3>
            <p className="text-base leading-relaxed">
              This is a paragraph with normal text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-sm text-muted-foreground">
              This is smaller muted text for descriptions and secondary information.
            </p>
          </CardContent>
        </Card>

        {/* Components Test */}
        <Card>
          <CardHeader>
            <CardTitle>UI Components Test</CardTitle>
            <CardDescription>Testing Shadcn/UI components styling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons */}
            <div className="space-y-2">
              <h4 className="font-medium">Buttons</h4>
              <div className="flex flex-wrap gap-2">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-2">
              <h4 className="font-medium">Form Elements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                <Input placeholder="Text input" />
                <Input type="email" placeholder="Email input" />
                <Input type="password" placeholder="Password" />
                <Input disabled placeholder="Disabled input" />
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <h4 className="font-medium">Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-2">
              <h4 className="font-medium">Alerts</h4>
              <div className="space-y-3">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Info Alert</AlertTitle>
                  <AlertDescription>
                    This is an informational alert message.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning Alert</AlertTitle>
                  <AlertDescription>
                    This is a warning alert message.
                  </AlertDescription>
                </Alert>

                <Alert className="border-red-200 bg-red-50">
                  <X className="h-4 w-4" />
                  <AlertTitle>Error Alert</AlertTitle>
                  <AlertDescription>
                    This is an error alert message.
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success Alert</AlertTitle>
                  <AlertDescription>
                    This is a success alert message.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout Test */}
        <Card>
          <CardHeader>
            <CardTitle>Layout Test</CardTitle>
            <CardDescription>Testing responsive layouts and spacing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CSS Custom Properties Test */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Variables Test</CardTitle>
            <CardDescription>Testing CSS custom properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                <p style={{ color: 'hsl(var(--primary-foreground))' }}>
                  Primary background with primary-foreground text
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--secondary))' }}>
                <p style={{ color: 'hsl(var(--secondary-foreground))' }}>
                  Secondary background with secondary-foreground text
                </p>
              </div>
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}>
                <p style={{ color: 'hsl(var(--card-foreground))' }}>
                  Card background with border and card-foreground text
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tailwind Classes Test */}
        <Card>
          <CardHeader>
            <CardTitle>Tailwind Classes Test</CardTitle>
            <CardDescription>Testing if Tailwind utility classes are working</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800">Red utility classes</p>
              </div>
              <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                <p className="text-blue-800">Blue utility classes</p>
              </div>
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-green-800">Green utility classes</p>
              </div>
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <div className="w-4 h-4 bg-pink-500 rounded"></div>
                <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>System information for debugging</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <p>Environment: {process.env.NODE_ENV}</p>
              <p>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</p>
              <p>Screen Size: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Server'}</p>
              <p>CSS Variables Available: {typeof window !== 'undefined' && typeof getComputedStyle !== 'undefined' ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}