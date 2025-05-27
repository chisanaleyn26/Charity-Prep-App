import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function StyleTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Style Test Page</h1>
          <p className="text-lg text-muted-foreground">Testing CSS and component styling</p>
        </div>

        {/* Basic Styling Test */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Component Test</CardTitle>
            <CardDescription>Testing if components are styled correctly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Color Test */}
        <Card>
          <CardHeader>
            <CardTitle>Color System Test</CardTitle>
            <CardDescription>Testing custom color variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="h-16 bg-primary rounded border"></div>
                <p className="text-sm">Primary</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 bg-secondary rounded border"></div>
                <p className="text-sm">Secondary</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 bg-muted rounded border"></div>
                <p className="text-sm">Muted</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 bg-accent rounded border"></div>
                <p className="text-sm">Accent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tailwind Utility Test */}
        <Card>
          <CardHeader>
            <CardTitle>Tailwind Utilities Test</CardTitle>
            <CardDescription>Testing standard Tailwind utility classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800">Red background with border</p>
              </div>
              <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                <p className="text-blue-800">Blue background with border</p>
              </div>
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-green-800">Green background with border</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-800 font-medium">
                If you can see this styled properly, your CSS is working correctly!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}