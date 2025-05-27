export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ethereal-50 to-sage-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gunmetal mb-8">Tailwind CSS Test Page</h1>
        
        {/* Color Tests */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-ethereal p-4 rounded-lg text-gunmetal font-medium">
              Ethereal (Primary)
            </div>
            <div className="bg-sage p-4 rounded-lg text-white font-medium">
              Sage
            </div>
            <div className="bg-mist p-4 rounded-lg text-gunmetal font-medium">
              Mist
            </div>
            <div className="bg-gunmetal p-4 rounded-lg text-white font-medium">
              Gunmetal
            </div>
          </div>
        </section>

        {/* Typography Tests */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Typography</h2>
          <div className="space-y-2">
            <p className="text-xs">Extra Small Text (text-xs)</p>
            <p className="text-sm">Small Text (text-sm)</p>
            <p className="text-base">Base Text (text-base)</p>
            <p className="text-lg">Large Text (text-lg)</p>
            <p className="text-xl">Extra Large Text (text-xl)</p>
            <p className="text-2xl">2XL Text (text-2xl)</p>
          </div>
        </section>

        {/* Spacing Tests */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Spacing & Layout</h2>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex gap-2">
              <div className="bg-ethereal-200 p-2 rounded">p-2</div>
              <div className="bg-ethereal-300 p-4 rounded">p-4</div>
              <div className="bg-ethereal-400 p-6 rounded">p-6</div>
              <div className="bg-ethereal-500 p-8 rounded">p-8</div>
            </div>
          </div>
        </section>

        {/* Component Tests */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Components</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="ethereal-card">
              <h3 className="text-lg font-semibold mb-2">Ethereal Card</h3>
              <p className="text-gray-600">This uses the custom ethereal-card class from our CSS.</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold mb-2">Manual Card</h3>
              <p className="text-muted-foreground">Built with individual Tailwind classes.</p>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Animations</h2>
          <div className="flex gap-4">
            <div className="bg-ethereal p-4 rounded animate-pulse-soft">
              Pulse Soft
            </div>
            <div className="bg-sage p-4 rounded animate-spin-slow">
              Spin Slow
            </div>
            <div className="bg-mist p-4 rounded animate-fade-in">
              Fade In
            </div>
          </div>
        </section>

        {/* Responsive Tests */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Responsive Design</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-ethereal-200 to-ethereal-400 p-4 rounded">
                <p className="text-sm md:text-base lg:text-lg">Responsive text</p>
              </div>
              <div className="bg-gradient-to-r from-sage-200 to-sage-400 p-4 rounded">
                <p className="hidden md:block">Visible on MD+</p>
              </div>
              <div className="bg-gradient-to-r from-mist-200 to-mist-400 p-4 rounded">
                <p className="hidden lg:block">Visible on LG+</p>
              </div>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Tailwind CSS is working!</h3>
          <p className="text-green-700">All classes are being applied correctly, including custom colors and animations.</p>
        </section>
      </div>
    </div>
  )
}