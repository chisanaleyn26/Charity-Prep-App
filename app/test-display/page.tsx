'use client'

export default function TestDisplayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ethereal-50 to-ethereal-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Tailwind CSS Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Card 1 */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Primary Colors</h2>
            <div className="space-y-2">
              <div className="h-12 bg-primary rounded"></div>
              <div className="h-12 bg-primary/50 rounded"></div>
              <div className="h-12 bg-primary/20 rounded"></div>
            </div>
          </div>
          
          {/* Test Card 2 */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-secondary">Secondary Colors</h2>
            <div className="space-y-2">
              <div className="h-12 bg-secondary rounded"></div>
              <div className="h-12 bg-secondary/50 rounded"></div>
              <div className="h-12 bg-secondary/20 rounded"></div>
            </div>
          </div>
          
          {/* Test Card 3 */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-accent">Accent Colors</h2>
            <div className="space-y-2">
              <div className="h-12 bg-accent rounded"></div>
              <div className="h-12 bg-accent/50 rounded"></div>
              <div className="h-12 bg-accent/20 rounded"></div>
            </div>
          </div>
          
          {/* Test Card 4 */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4">Typography</h2>
            <p className="text-sm text-muted-foreground">Small muted text</p>
            <p className="text-base">Base text size</p>
            <p className="text-lg font-medium">Large medium text</p>
            <p className="text-xl font-bold">Extra large bold</p>
          </div>
        </div>
        
        {/* Test Buttons */}
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-semibold mb-4">Button Styles</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
              Secondary Button
            </button>
            <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors">
              Accent Button
            </button>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors">
              Destructive Button
            </button>
          </div>
        </div>
        
        {/* Test Ethereal Colors */}
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-semibold mb-4">Ethereal Design System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="h-20 bg-ethereal rounded-lg mb-2"></div>
              <p className="text-sm">Ethereal</p>
            </div>
            <div className="text-center">
              <div className="h-20 bg-sage rounded-lg mb-2"></div>
              <p className="text-sm">Sage</p>
            </div>
            <div className="text-center">
              <div className="h-20 bg-mist rounded-lg mb-2"></div>
              <p className="text-sm">Mist</p>
            </div>
            <div className="text-center">
              <div className="h-20 bg-gunmetal rounded-lg mb-2"></div>
              <p className="text-sm">Gunmetal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}