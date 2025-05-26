'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section id="hero" className="relative bg-white py-32 px-4 overflow-hidden">
      {/* CSS-only geometric background - Asymmetrical & Organic */}
      <div className="absolute inset-0 z-0">
        {/* Primary focal area - Top-right with bold elements */}
        <div className="absolute top-0 right-0 w-64 h-48">
          <div className="absolute top-12 right-16 w-24 h-24 border-2 border-gray-300 rotate-45 opacity-60"></div>
          <div className="absolute top-6 right-6 w-32 h-2 bg-gray-300 rotate-45 opacity-70"></div>
          <div className="absolute top-24 right-8 w-16 h-16 bg-gray-200 rotate-12 opacity-50"></div>
          <div className="absolute top-8 right-32 w-8 h-8 bg-[#B1FA63] opacity-50 rotate-45"></div>
          <div className="absolute top-32 right-24 w-20 h-1 bg-gray-300 rotate-[30deg] opacity-60"></div>
        </div>
        
        {/* Secondary accent - Bottom-left with medium presence */}
        <div className="absolute bottom-0 left-0 w-40 h-32">
          <div className="absolute bottom-8 left-12 w-16 h-16 border border-gray-300 rotate-12 opacity-40"></div>
          <div className="absolute bottom-16 left-6 w-12 h-2 bg-gray-200 opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-[#B1FA63] opacity-30"></div>
        </div>
        
        {/* Subtle accent - Top-left with minimal elements */}
        <div className="absolute top-0 left-0 w-24 h-24">
          <div className="absolute top-8 left-8 w-8 h-8 border border-gray-200 rotate-45 opacity-30"></div>
          <div className="absolute top-4 left-16 w-2 h-2 bg-gray-300 opacity-40"></div>
        </div>
        
        {/* Flowing element - Mid-right edge */}
        <div className="absolute top-1/2 right-0 w-16 h-32 -translate-y-1/2">
          <div className="absolute top-8 right-4 w-12 h-1 bg-gray-200 rotate-90 opacity-40"></div>
          <div className="absolute top-16 right-2 w-4 h-4 bg-[#B1FA63] opacity-25 rotate-45"></div>
        </div>
        
        {/* Organic floating element - Off-grid placement */}
        <div className="absolute bottom-32 left-48 w-12 h-12">
          <div className="absolute top-2 left-2 w-8 h-8 border border-gray-200 rotate-12 opacity-25"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12"
        >
          {/* Main headline */}
          <div className="space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-6xl lg:text-7xl font-light text-[#1a1a1a] leading-tight tracking-tight"
            >
              Annual Return
              <br />
              <span className="font-medium">Stress?</span>
              <br />
              <span className="text-[#B1FA63] font-medium">Sorted.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-xl text-[#666] leading-relaxed max-w-2xl mx-auto font-light"
            >
              AI-powered compliance for UK charities.
              <br />
              Built for the 2024 regulations.
            </motion.p>
          </div>
          
          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/login" 
                className="inline-block bg-[#B1FA63] text-[#1a1a1a] px-12 py-4 rounded-full font-medium hover:bg-[#9FE050] transition-colors duration-200 shadow-lg"
              >
                Try CharityPrep
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-center gap-8 text-sm text-[#999] font-light"
            >
              <span>5-minute setup</span>
              <span className="w-1 h-1 bg-[#ddd] rounded-full"></span>
              <span>30-day trial</span>
              <span className="w-1 h-1 bg-[#ddd] rounded-full"></span>
              <span>No credit card</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}