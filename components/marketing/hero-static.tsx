import React from 'react'
import Link from 'next/link'

export default function HeroStatic() {
  return (
    <section id="hero" className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-32 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-80 h-64">
          <div className="absolute top-16 right-20 w-32 h-32 border-2 border-gray-300 rotate-45 opacity-60"></div>
          <div className="absolute top-12 right-40 w-12 h-12 bg-ethereal opacity-50 rotate-45"></div>
        </div>
      </div>
      
      {/* Content - Static version without motion */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="space-y-12">
          {/* Main headline */}
          <div className="space-y-8">
            <h1 className="text-6xl lg:text-7xl font-light text-black leading-tight tracking-tight">
              Annual Return
              <br />
              <span className="font-medium">Stress?</span>
              <br />
              <span className="text-ethereal font-medium">Sorted.</span>
            </h1>
            
            <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto font-light">
              AI-powered compliance for UK charities.
              <br />
              Built for the 2024 regulations.
            </p>
          </div>
          
          {/* CTA */}
          <div className="space-y-6">
            <div>
              <Link 
                href="/login" 
                className="inline-block bg-ethereal text-black px-12 py-4 rounded-full font-medium hover:bg-ethereal/90 transition-colors duration-200 shadow-lg"
              >
                Try CharityPrep
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 font-light">
              <span>5-minute setup</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>30-day trial</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>No credit card</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}