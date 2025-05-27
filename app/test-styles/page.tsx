export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">CSS/Tailwind Test Page</h1>
        
        <div className="space-y-6">
          {/* Basic Tailwind Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Basic Tailwind Classes</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-500 text-white p-4 rounded">Red</div>
              <div className="bg-green-500 text-white p-4 rounded">Green</div>
              <div className="bg-blue-500 text-white p-4 rounded">Blue</div>
            </div>
          </div>

          {/* Custom Theme Colors */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Custom Theme Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary text-primary-foreground p-4 rounded">
                Primary (Ethereal)
              </div>
              <div className="bg-secondary text-secondary-foreground p-4 rounded">
                Secondary (Gunmetal)
              </div>
              <div className="bg-ethereal text-gunmetal p-4 rounded">
                Ethereal Brand Color
              </div>
              <div className="bg-muted text-muted-foreground p-4 rounded">
                Muted Background
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Typography</h2>
            <h1 className="text-6xl mb-2">Heading 1</h1>
            <h2 className="text-5xl mb-2">Heading 2</h2>
            <h3 className="text-4xl mb-2">Heading 3</h3>
            <h4 className="text-3xl mb-2">Heading 4</h4>
            <p className="text-base">Regular paragraph text</p>
            <p className="text-sm text-gray-600">Small muted text</p>
          </div>

          {/* Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
            <div className="flex gap-4 flex-wrap">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Default Button
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90">
                Secondary Button
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Outline Button
              </button>
            </div>
          </div>

          {/* Responsive Grid */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Responsive Grid</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-200 p-4 rounded text-center">Col 1</div>
              <div className="bg-gray-300 p-4 rounded text-center">Col 2</div>
              <div className="bg-gray-400 p-4 rounded text-center">Col 3</div>
              <div className="bg-gray-500 text-white p-4 rounded text-center">Col 4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}