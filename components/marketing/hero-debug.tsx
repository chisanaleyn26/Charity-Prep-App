'use client'

import React from 'react'
import Link from 'next/link'

export default function HeroDebug() {
  return (
    <section style={{ 
      position: 'relative',
      backgroundColor: '#f5f5f5',
      padding: '8rem 1rem',
      minHeight: '600px',
      border: '5px solid red'
    }}>
      {/* Debug info */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        backgroundColor: 'yellow', 
        padding: '10px',
        zIndex: 100 
      }}>
        <p style={{ color: 'black', fontWeight: 'bold' }}>HERO COMPONENT IS RENDERING</p>
      </div>
      
      {/* Main content */}
      <div style={{ 
        position: 'relative',
        zIndex: 10,
        maxWidth: '1024px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '4rem',
          fontWeight: 'bold',
          color: 'black',
          marginBottom: '2rem'
        }}>
          Annual Return<br />
          <span>Stress?</span><br />
          <span style={{ color: '#22c55e' }}>Sorted.</span>
        </h1>
        
        <p style={{ 
          fontSize: '1.5rem',
          color: '#4b5563',
          marginBottom: '3rem'
        }}>
          AI-powered compliance for UK charities.<br />
          Built for the 2024 regulations.
        </p>
        
        <div>
          <Link 
            href="/login" 
            style={{
              display: 'inline-block',
              backgroundColor: '#22c55e',
              color: 'white',
              padding: '1rem 3rem',
              borderRadius: '9999px',
              fontSize: '1.125rem',
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            Try CharityPrep
          </Link>
        </div>
      </div>
    </section>
  )
}