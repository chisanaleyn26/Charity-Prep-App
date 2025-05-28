import HeroSimple from '@/components/marketing/hero-simple'

export default function HomePage() {
  return (
    <>
      <HeroSimple />
      
      {/* Features section */}
      <section className="py-32 px-4 bg-gray-50">
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
            
            <div className="border-l-4 border-green-500 pl-8">
              <h3 className="text-2xl font-medium text-black mb-4">
                Natural Search
              </h3>
              <p className="text-lg text-gray-700">
                Ask "Show DBS expiring in March" and get exactly what you need.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-4">
              Simple pricing
            </h2>
            <p className="text-xl text-gray-600">
              Predictable annual pricing based on your charity's size
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Essentials Tier */}
            <div className="border-2 border-gray-200 rounded-lg p-8 hover:border-gray-300 transition-colors">
              <h3 className="text-2xl font-medium text-black mb-2">Essentials</h3>
              <p className="text-sm text-gray-600 mb-6">For small charities (income &lt; £100k)</p>
              <div className="mb-8">
                <p className="text-5xl font-light text-black">£199</p>
                <p className="text-gray-600">per year</p>
                <p className="text-sm text-gray-500">(~£17/month)</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>All core compliance modules</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Annual Return data export</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Automated reminders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Compliance dashboard</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>1-2 user accounts</span>
                </li>
              </ul>
              
              <a href="/login" className="block text-center bg-gray-200 text-black py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                Get Started
              </a>
            </div>
            
            {/* Standard Tier - Highlighted */}
            <div className="border-2 border-green-500 rounded-lg p-8 shadow-lg relative transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-medium text-black mb-2">Standard</h3>
              <p className="text-sm text-gray-600 mb-6">For medium charities (£100k - £1m)</p>
              <div className="mb-8">
                <p className="text-5xl font-light text-black">£549</p>
                <p className="text-gray-600">per year</p>
                <p className="text-sm text-gray-500">(~£46/month)</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="font-medium">Everything in Essentials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Up to 5 user accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Document upload & storage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority email support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Multi-year data history</span>
                </li>
              </ul>
              
              <a href="/login" className="block text-center bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">
                Get Started
              </a>
            </div>
            
            {/* Premium Tier */}
            <div className="border-2 border-gray-200 rounded-lg p-8 hover:border-gray-300 transition-colors">
              <h3 className="text-2xl font-medium text-black mb-2">Premium</h3>
              <p className="text-sm text-gray-600 mb-6">For large charities (income &gt; £1m)</p>
              <div className="mb-8">
                <p className="text-5xl font-light text-black">£1,199+</p>
                <p className="text-gray-600">per year</p>
                <p className="text-sm text-gray-500">(~£100+/month)</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="font-medium">Everything in Standard</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>10+ user accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Enhanced document storage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority phone support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>API access (coming soon)</span>
                </li>
              </ul>
              
              <a href="/login" className="block text-center bg-gray-200 text-black py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
          
          <div className="mt-12 text-center text-gray-600">
            <p className="mb-2">All prices exclude VAT. Monthly billing available at 20% premium.</p>
            <p>Need help choosing? <a href="/contact" className="text-green-600 hover:text-green-700 underline">Contact our team</a></p>
          </div>
        </div>
      </section>
    </>
  )
}