import React from 'react'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { Shield, Award, Clock } from 'lucide-react'

export function CTASection() {
  const trustBadges = [
    { icon: Shield, text: 'ICO Registered' },
    { icon: Award, text: 'Charity Excellence Award' },
    { icon: Clock, text: '99.9% Uptime' },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-[#243837] to-[#1a2827] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#B1FA63]/10 blur-3xl" />
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#B2A1FF]/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to simplify your{' '}
            <span className="text-[#B1FA63]">charity compliance?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of UK charities who&apos;ve already transformed their compliance process. 
            Start your free trial today - no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <EtherealButton size="xl" variant="primary" className="min-w-[200px]">
              Start Free 14-Day Trial
            </EtherealButton>
            <EtherealButton size="xl" variant="tertiary" className="min-w-[200px]">
              Schedule a Demo
            </EtherealButton>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-400">
                <badge.icon className="h-5 w-5 text-[#B1FA63]" />
                <span className="text-sm">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}