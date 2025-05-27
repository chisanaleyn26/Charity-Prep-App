import TestClient from './test-client';

export default function TestCSSPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CSS Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tailwind Test</h2>
            <p className="text-gray-600">If you can see styled content, Tailwind is working.</p>
          </div>
          
          <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Primary Color Test</h2>
            <p>This should be using the Inchworm color.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Blue Button
          </button>
          
          <button className="px-4 py-2 bg-ethereal text-gunmetal rounded hover:bg-ethereal-600">
            Ethereal Button
          </button>
          
          <div className="p-4 bg-muted text-muted-foreground rounded">
            Muted background test
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8">
          <TestClient />
        </div>
      </div>
    </div>
  )
}