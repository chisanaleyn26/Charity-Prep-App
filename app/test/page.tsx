import DebugCSS from './debug'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">CSS Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Test Tailwind utility classes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tailwind Utilities</h2>
            <p className="text-gray-600 mb-2">If you see styled content, Tailwind is working!</p>
            <div className="flex gap-2">
              <div className="w-12 h-12 bg-blue-500 rounded"></div>
              <div className="w-12 h-12 bg-green-500 rounded"></div>
              <div className="w-12 h-12 bg-red-500 rounded"></div>
            </div>
          </div>
          
          {/* Test custom colors */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Custom Colors</h2>
            <div className="space-y-2">
              <div className="p-3 bg-primary text-primary-foreground rounded">Primary</div>
              <div className="p-3 bg-secondary text-secondary-foreground rounded">Secondary</div>
              <div className="p-3 bg-accent text-accent-foreground rounded">Accent</div>
            </div>
          </div>
          
          {/* Test Ethereal colors */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ethereal Colors</h2>
            <div className="space-y-2">
              <div className="p-3 bg-ethereal text-black rounded">Ethereal (Inchworm)</div>
              <div className="p-3 bg-sage text-white rounded">Sage</div>
              <div className="p-3 bg-mist text-black rounded">Mist</div>
            </div>
          </div>
          
          {/* Test responsive design */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Responsive</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl">
                This text changes size based on screen width
              </p>
            </div>
          </div>
        </div>
        
        {/* CSS Variables Check */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">CSS Variables</h2>
          <div className="font-mono text-sm space-y-1">
            <div>--tailwind-loaded: <span id="tailwind-check" className="text-red-500">Not loaded</span></div>
            <div>--primary: <span id="primary-check" className="text-red-500">Not set</span></div>
          </div>
        </div>
        
        {/* Debug Component */}
        <DebugCSS />
      </div>
      
      <script dangerouslySetInnerHTML={{__html: `
        // Check if CSS variables are loaded
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            const styles = getComputedStyle(document.documentElement);
            const tailwindLoaded = styles.getPropertyValue('--tailwind-loaded');
            const primaryColor = styles.getPropertyValue('--primary');
            
            const tailwindCheck = document.getElementById('tailwind-check');
            const primaryCheck = document.getElementById('primary-check');
            
            if (tailwindCheck) {
              tailwindCheck.textContent = tailwindLoaded ? 'Loaded ✓' : 'Not loaded ✗';
              tailwindCheck.className = tailwindLoaded ? 'text-green-500' : 'text-red-500';
            }
            
            if (primaryCheck) {
              primaryCheck.textContent = primaryColor ? primaryColor + ' ✓' : 'Not set ✗';
              primaryCheck.className = primaryColor ? 'text-green-500' : 'text-red-500';
            }
          }, 100);
        }
      `}} />
    </div>
  )
}