import React from 'react'

export function Footer() {
  return (
    <footer className="py-16 px-4 bg-gradient-to-t from-gray-100 to-gray-50 border-t border-[#f0f0f0]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-[#1a1a1a] mb-2">
            CharityPrep
          </h3>
          <p className="text-[#666] font-light">
            Annual returns, sorted.
          </p>
        </div>
        
        <div className="text-sm text-[#999] font-light">
          © 2024 CharityPrep
        </div>
      </div>
    </footer>
  )
}