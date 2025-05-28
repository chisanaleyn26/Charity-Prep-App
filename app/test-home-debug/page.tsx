export default function TestHomeDebugPage() {
  return (
    <div className="min-h-screen">
      {/* Debug with inline styles first */}
      <div style={{ backgroundColor: 'red', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          DEBUG: This red bar should be visible at the top
        </h1>
      </div>
      
      {/* Test basic rendering */}
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
        <h2 style={{ color: 'black', fontSize: '20px', marginBottom: '10px' }}>
          Step 1: Basic HTML is rendering ✓
        </h2>
      </div>
      
      {/* Test Tailwind classes */}
      <div className="p-5 bg-blue-500 text-white">
        <h2 className="text-xl font-bold">
          Step 2: If this is blue with white text, Tailwind is working
        </h2>
      </div>
      
      {/* Test importing a component */}
      <div style={{ padding: '20px', border: '2px solid green' }}>
        <h2 style={{ color: 'green', fontSize: '20px', marginBottom: '10px' }}>
          Step 3: Testing component import...
        </h2>
        {(() => {
          try {
            const Hero = require('@/components/marketing/hero').default
            return (
              <>
                <p style={{ color: 'green' }}>✓ Hero component imported successfully</p>
                <div style={{ border: '2px solid orange', marginTop: '10px' }}>
                  <Hero />
                </div>
              </>
            )
          } catch (error) {
            return <p style={{ color: 'red' }}>✗ Error importing Hero: {error.message}</p>
          }
        })()}
      </div>
      
      {/* Show what layout is being used */}
      <div style={{ padding: '20px', backgroundColor: 'yellow', color: 'black' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>
          Step 4: Layout Information
        </h2>
        <p>This page should be using the root layout at /app/layout.tsx</p>
        <p>It is NOT using the marketing layout (which has header/footer)</p>
      </div>
    </div>
  )
}