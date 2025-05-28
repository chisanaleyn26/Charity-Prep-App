'use client'

import { useEffect, useState } from 'react'

export default function DebugCSS() {
  const [cssStatus, setCssStatus] = useState<{
    tailwindLoaded: boolean
    cssVariables: Record<string, string>
    stylesheets: string[]
  }>({
    tailwindLoaded: false,
    cssVariables: {},
    stylesheets: []
  })

  useEffect(() => {
    // Check if Tailwind CSS is loaded
    const checkStyles = () => {
      const styles = getComputedStyle(document.documentElement)
      const tailwindCheck = styles.getPropertyValue('--tailwind-loaded')
      
      // Get all CSS variables
      const cssVars: Record<string, string> = {}
      const allStyles = Array.from(document.styleSheets)
      
      // Check for important CSS variables
      const importantVars = ['--primary', '--secondary', '--background', '--foreground', '--ethereal', '--sage', '--mist']
      importantVars.forEach(varName => {
        const value = styles.getPropertyValue(varName)
        if (value) {
          cssVars[varName] = value
        }
      })
      
      // Get loaded stylesheets
      const stylesheets = allStyles.map(sheet => {
        try {
          return sheet.href || 'inline-styles'
        } catch (e) {
          return 'cross-origin-blocked'
        }
      })
      
      setCssStatus({
        tailwindLoaded: !!tailwindCheck || Object.keys(cssVars).length > 0,
        cssVariables: cssVars,
        stylesheets
      })
    }
    
    // Check immediately and after a delay
    checkStyles()
    const timer = setTimeout(checkStyles, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>CSS Debug Information</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Status:</h2>
        <p>Tailwind Loaded: {cssStatus.tailwindLoaded ? '✅ Yes' : '❌ No'}</p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>CSS Variables Found:</h2>
        {Object.keys(cssStatus.cssVariables).length === 0 ? (
          <p>❌ No CSS variables found</p>
        ) : (
          <ul>
            {Object.entries(cssStatus.cssVariables).map(([key, value]) => (
              <li key={key}>{key}: {value}</li>
            ))}
          </ul>
        )}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Stylesheets:</h2>
        {cssStatus.stylesheets.length === 0 ? (
          <p>❌ No stylesheets found</p>
        ) : (
          <ul>
            {cssStatus.stylesheets.map((sheet, index) => (
              <li key={index}>{sheet}</li>
            ))}
          </ul>
        )}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Tailwind Classes Test:</h2>
        <div className="bg-blue-500 text-white p-4 rounded">
          If this box is blue with white text, Tailwind is working!
        </div>
      </div>
    </div>
  )
}