'use client'

export default function TestFixedTailwindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">Tailwind CSS Fixed! 🎉</h1>
          <p className="text-xl text-muted-foreground">All components now use theme colors instead of hardcoded values</p>
        </div>
        
        {/* Color System Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Ethereal Colors */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-ethereal">Ethereal System</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-ethereal rounded"></div>
                <span className="text-foreground">Primary (Ethereal)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gunmetal rounded"></div>
                <span className="text-foreground">Gunmetal</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sage rounded"></div>
                <span className="text-foreground">Sage</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-mist rounded"></div>
                <span className="text-foreground">Mist</span>
              </div>
            </div>
          </div>
          
          {/* Theme Colors */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Theme Colors</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded"></div>
                <span className="text-foreground">Primary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded"></div>
                <span className="text-foreground">Secondary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent rounded"></div>
                <span className="text-foreground">Accent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded"></div>
                <span className="text-foreground">Muted</span>
              </div>
            </div>
          </div>
          
          {/* Text Colors */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4">Text Colors</h2>
            <div className="space-y-3">
              <p className="text-foreground">Foreground text</p>
              <p className="text-muted-foreground">Muted foreground</p>
              <p className="text-muted-foreground/70">Muted 70% opacity</p>
              <p className="text-card-foreground">Card foreground</p>
              <p className="text-primary">Primary text</p>
              <p className="text-ethereal">Ethereal text</p>
            </div>
          </div>
        </div>
        
        {/* Utility Colors */}
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-semibold mb-4">Utility Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="h-20 bg-border rounded mb-2"></div>
              <p className="text-sm text-muted-foreground">Border</p>
            </div>
            <div className="text-center">
              <div className="h-20 bg-gray-100 rounded mb-2"></div>
              <p className="text-sm text-muted-foreground">Gray 100</p>
            </div>
            <div className="text-center">
              <div className="h-20 bg-gray-200 rounded mb-2"></div>
              <p className="text-sm text-muted-foreground">Gray 200</p>
            </div>
            <div className="text-center">
              <div className="h-20 bg-gray-700 rounded mb-2"></div>
              <p className="text-sm text-muted-foreground">Gray 700</p>
            </div>
          </div>
        </div>
        
        {/* Fixed Components Demo */}
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-semibold mb-4">Fixed Components</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>✅ Hero component - All colors using theme</li>
            <li>✅ Features component - Theme colors applied</li>
            <li>✅ Pricing component - Fixed all hardcoded values</li>
            <li>✅ Navigation - Using gunmetal and ethereal</li>
            <li>✅ Footer - Theme colors implemented</li>
            <li>✅ Auth layout - Gray scale from theme</li>
            <li>✅ Onboarding - All colors themed</li>
          </ul>
        </div>
        
        {/* Button Examples */}
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-semibold mb-4">Button Styles (Theme-based)</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-ethereal text-foreground rounded-full font-medium hover:bg-ethereal/90 transition-colors">
              Ethereal Button
            </button>
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Primary Button
            </button>
            <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
              Secondary Button
            </button>
            <button className="px-6 py-3 border-2 border-ethereal text-ethereal rounded-md hover:bg-ethereal/10 transition-colors">
              Outline Ethereal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}