import { redirect } from 'next/navigation'
import Hero from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { Pricing } from '@/components/marketing/pricing'
import { Footer } from '@/components/marketing/footer'

// MOCK MODE - Set to false to show marketing page
const MOCK_MODE = true

export default function HomePage() {
  if (MOCK_MODE) {
    redirect('/dashboard')
  }

  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </>
  )
}