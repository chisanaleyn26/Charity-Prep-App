import Hero from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { Pricing } from '@/components/marketing/pricing'
import { Footer } from '@/components/marketing/footer'

export default function TestLandingFixedPage() {
  return (
    <div className="min-h-screen">
      {/* Debug header */}
      <div className="bg-green-500 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">✅ Landing Page Fixed - Content Should Be Visible Below</h1>
      </div>
      
      {/* Original landing page components */}
      <Hero />
      <Features />
      <Pricing />
      <Footer />
      
      {/* Debug footer */}
      <div className="bg-green-500 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">✅ If you can see Hero, Features, Pricing above - the fix worked!</h1>
      </div>
    </div>
  )
}