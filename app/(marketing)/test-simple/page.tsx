import HeroSimple from '@/components/marketing/hero-simple'

export default function TestSimplePage() {
  return (
    <>
      {/* Direct content first to test rendering */}
      <div className="bg-red-500 text-white p-8 text-center">
        <h1 className="text-3xl font-bold">If you see this red section, the page is rendering</h1>
      </div>
      
      {/* Simple hero without animations or complex styles */}
      <HeroSimple />
      
      {/* Simple features section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-light text-black text-center mb-16">
            Software that actually helps
          </h2>
          
          <div className="space-y-16">
            <div className="border-l-4 border-green-500 pl-8">
              <h3 className="text-2xl font-medium text-black mb-4">
                Email Processing
              </h3>
              <p className="text-lg text-gray-700">
                Forward receipts to data@charityprep.uk and watch AI categorize everything automatically.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-8">
              <h3 className="text-2xl font-medium text-black mb-4">
                Smart Tracking
              </h3>
              <p className="text-lg text-gray-700">
                Upload photos of DBS certificates. OCR extracts dates and details instantly.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Bottom marker */}
      <div className="bg-green-500 text-white p-8 text-center">
        <h1 className="text-3xl font-bold">If you see this green section, content is rendering properly</h1>
      </div>
    </>
  )
}