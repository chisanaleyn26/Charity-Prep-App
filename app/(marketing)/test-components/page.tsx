export default function TestComponentsPage() {
  return (
    <div className="min-h-screen">
      {/* Test 1: Basic visibility */}
      <div style={{ backgroundColor: 'red', padding: '20px', margin: '20px' }}>
        <h1 style={{ color: 'white', fontSize: '24px' }}>TEST 1: Can you see this red box?</h1>
      </div>
      
      {/* Test 2: Import Hero and wrap in debug border */}
      <div style={{ border: '5px solid blue', padding: '10px', margin: '20px' }}>
        <h2 style={{ color: 'blue', fontSize: '20px', marginBottom: '10px' }}>TEST 2: Hero Component (blue border):</h2>
        {(() => {
          try {
            const Hero = require('@/components/marketing/hero').default
            return (
              <div style={{ minHeight: '200px', backgroundColor: '#f0f0f0' }}>
                <Hero />
              </div>
            )
          } catch (e) {
            return <p style={{ color: 'red' }}>Error loading Hero: {e.message}</p>
          }
        })()}
      </div>
      
      {/* Test 3: Import Features */}
      <div style={{ border: '5px solid green', padding: '10px', margin: '20px' }}>
        <h2 style={{ color: 'green', fontSize: '20px', marginBottom: '10px' }}>TEST 3: Features Component (green border):</h2>
        {(() => {
          try {
            const { Features } = require('@/components/marketing/features')
            return (
              <div style={{ minHeight: '200px', backgroundColor: '#f0f0f0' }}>
                <Features />
              </div>
            )
          } catch (e) {
            return <p style={{ color: 'red' }}>Error loading Features: {e.message}</p>
          }
        })()}
      </div>
      
      {/* Test 4: Direct content test */}
      <div style={{ border: '5px solid orange', padding: '20px', margin: '20px' }}>
        <h2 style={{ color: 'orange', fontSize: '20px', marginBottom: '10px' }}>TEST 4: Direct HTML content:</h2>
        <section className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-32 px-4 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-black">
              This is a test headline
            </h1>
            <p className="text-xl text-black mt-4">
              If you can see this, basic HTML/CSS works
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}