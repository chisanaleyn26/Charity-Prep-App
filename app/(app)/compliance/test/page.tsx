import { Palette, Code, TestTube, CheckCircle } from 'lucide-react'

export default function TestPage() {
  return (
    <div className="space-y-10">
      {/* Enhanced Typography Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
            <TestTube className="h-12 w-12 text-gray-600" />
            CSS Test Page
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            This page tests if Tailwind CSS and typography styles are loading correctly.
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center gap-2 justify-end">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-green-600 tracking-wide uppercase">Active</p>
          </div>
        </div>
      </div>

      {/* Color Palette Test */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all duration-300">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight flex items-center gap-3">
              <Palette className="h-6 w-6 text-gray-600" />
              Color Palette Test
            </h2>
            <p className="text-gray-600 font-medium tracking-wide leading-relaxed">
              Testing the minimalistic gray palette with green and red accents.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 text-gray-900 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-base font-semibold tracking-wide mb-2">Gray Foundation</h3>
              <p className="text-sm font-medium text-gray-600">Primary neutral palette</p>
            </div>
            <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-200">
              <h3 className="text-base font-semibold tracking-wide mb-2">Success/Positive</h3>
              <p className="text-sm font-medium text-green-600">Green accent for success states</p>
            </div>
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200">
              <h3 className="text-base font-semibold tracking-wide mb-2">Warning/Error</h3>
              <p className="text-sm font-medium text-red-600">Red accent for alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Test */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all duration-300">
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight flex items-center gap-3">
              <Code className="h-6 w-6 text-gray-600" />
              Typography Test
            </h2>
            <p className="text-gray-600 font-medium tracking-wide leading-relaxed">
              Testing enhanced typography hierarchy and spacing.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Display Text</h3>
              <div className="text-6xl font-extralight text-gray-900 tracking-tighter leading-none">92%</div>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Headings</h3>
              <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none mb-2">Main Header</h1>
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight mb-2">Section Header</h2>
              <h3 className="text-base font-semibold text-gray-900 tracking-wide leading-tight">Subsection</h3>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Body Text</h3>
              <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide mb-2">
                Large body text with enhanced readability and proper spacing.
              </p>
              <p className="text-sm text-gray-600 font-medium tracking-wide">
                Smaller supporting text with medium weight for subtle emphasis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-semibold text-green-700 tracking-tight">All Tests Passed</h3>
        </div>
        <p className="text-green-600 font-medium tracking-wide">
          If you can see this styled page with proper typography hierarchy, CSS is working correctly.
        </p>
      </div>
    </div>
  )
}