import React from 'react'

export function Footer() {
  return (
    <footer className="py-16 px-4 bg-gradient-to-t from-gray-100 to-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            CharityPrep
          </h3>
          <p className="text-gray-600 font-light">
            Annual returns, sorted.
          </p>
        </div>
        
        <div className="text-sm text-gray-500 font-light">
          © 2024 CharityPrep
        </div>
      </div>
    </footer>
  )
}