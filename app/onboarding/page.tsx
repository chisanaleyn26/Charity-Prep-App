'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { user, setCurrentOrganization, setOrganizations } = useAuthStore()
  
  const [formData, setFormData] = useState({
    name: '',
    charity_number: '',
    income_band: '',
    financial_year_end: '',
    primary_email: '',
    phone: '',
    website: '',
    address_line1: '',
    city: '',
    postcode: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setDebugInfo(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Check auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setError('You must be logged in to create an organization')
        setDebugInfo({ authError, user: null })
        setIsLoading(false)
        return
      }
      
      console.log('User authenticated:', user.id)
      
      // Validate required fields
      if (!formData.name || !formData.income_band || !formData.financial_year_end || !formData.primary_email) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }
      
      // Validate charity number format if provided
      if (formData.charity_number && !formData.charity_number.match(/^\d{6,8}(-\d{1,2})?$/)) {
        setError('Invalid charity number format. Please use 6-8 digits (e.g., 1234567) or 6-8 digits followed by a dash and 1-2 digits (e.g., 1234567-1)')
        setIsLoading(false)
        return
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.primary_email)) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        return
      }
      
      // Validate website URL if provided
      if (formData.website) {
        try {
          new URL(formData.website)
        } catch {
          setError('Please enter a valid website URL (e.g., https://www.example.org)')
          setIsLoading(false)
          return
        }
      }
      
      // Convert financial_year_end
      let convertedDate = formData.financial_year_end
      if (formData.financial_year_end && formData.financial_year_end.includes('-')) {
        const [day, month] = formData.financial_year_end.split('-')
        convertedDate = `2024-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      
      // First, ensure user profile exists
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
      
      if (userError) {
        console.error('User profile error:', userError)
      }
      
      // Try direct insert
      console.log('Creating organization...')
      const { data: orgData, error: insertError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          charity_number: formData.charity_number || null,
          income_band: formData.income_band,
          financial_year_end: convertedDate,
          primary_email: formData.primary_email,
          phone: formData.phone || null,
          website: formData.website || null,
          address_line1: formData.address_line1 || null,
          city: formData.city || null,
          postcode: formData.postcode || null
        })
        .select()
        .single()
      
      if (insertError) {
        // User-friendly error messages based on error codes
        let userMessage = 'Failed to create organization';
        
        if (insertError.code === '23505') {
          // Duplicate key error
          if (insertError.message.includes('charity_number')) {
            userMessage = 'This charity number is already registered. Please use a different charity number or leave it blank.';
          } else if (insertError.message.includes('primary_email')) {
            userMessage = 'An organization with this email address already exists.';
          } else if (insertError.message.includes('name')) {
            userMessage = 'An organization with this name already exists. Please choose a different name.';
          }
        } else if (insertError.code === '23514') {
          // Check constraint violation
          if (insertError.message.includes('charity_number')) {
            userMessage = 'Invalid charity number format. Please use 6-8 digits (e.g., 1234567 or 1234567-1).';
          } else if (insertError.message.includes('year_end')) {
            userMessage = 'Invalid financial year end. Please select a valid date.';
          }
        } else if (insertError.code === '42501') {
          // Insufficient privileges
          userMessage = 'You do not have permission to create an organization. Please contact support.';
        } else if (insertError.code === '23503') {
          // Foreign key violation
          userMessage = 'Invalid data reference. Please check your selections and try again.';
        } else if (insertError.code === '22001') {
          // String too long
          userMessage = 'One or more fields are too long. Please shorten your input and try again.';
        }
        
        setError(userMessage)
        setDebugInfo({ 
          error: insertError,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          errorDetails: insertError.details,
          errorHint: insertError.hint,
          user: { id: user.id, email: user.email }
        })
        setIsLoading(false)
        return
      }
      
      if (orgData) {
        // Create membership
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: orgData.id,
            user_id: user.id,
            role: 'admin',
            accepted_at: new Date().toISOString(),
            invited_by: user.id
          })
          .select()
          .single()
        
        if (memberError) {
          console.error('Membership error:', memberError)
          // Organization was created but membership failed - still allow them to continue
          setError('Organization created successfully, but there was an issue setting up your admin access. You may need to contact support to gain full access.')
          setDebugInfo({ 
            organizationCreated: true,
            orgId: orgData.id,
            membershipError: memberError,
            membershipErrorCode: memberError.code,
            membershipErrorMessage: memberError.message,
            message: 'Organization created but membership setup failed'
          })
          // Still redirect to dashboard - they may need to contact support
          setTimeout(() => router.push('/dashboard'), 3000)
          return
        }
        
        // Skip subscription creation for now - payments not set up yet
        console.log('Skipping subscription creation - payments not configured')
        
        // Update auth store with new organization
        setCurrentOrganization(orgData)
        if (memberData) {
          setOrganizations([{
            ...memberData,
            organization: orgData
          }])
        }
        
        console.log('Organization created successfully:', orgData)
        // Show success message briefly before redirect
        setError('')
        setDebugInfo({ 
          success: true,
          message: 'Organization created successfully! Redirecting to dashboard...',
          orgId: orgData.id
        })
        
        // Force a page refresh to ensure clean state
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
      
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError('Unexpected error - see debug info below')
      setDebugInfo({ 
        unexpectedError: err.message, 
        errorType: err.constructor.name,
        stack: err.stack 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '42rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Welcome to Charity Prep!</h1>
          <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>Let&apos;s set up your charity&apos;s account</p>
        </div>

        <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: '#B1FA63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Organization Details
            </h2>
            <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>We need some basic information about your charity to get started</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Basic Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Basic Information</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Charity Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    placeholder="St. Mary's Trust"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="charity_number" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Charity Number <span style={{ color: '#6b7280', fontWeight: 'normal' }}>(Optional)</span>
                  </label>
                  <input
                    id="charity_number"
                    type="text"
                    value={formData.charity_number}
                    onChange={(e) => setFormData({ ...formData, charity_number: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    placeholder="e.g. 1234567"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor="income_band" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Annual Income Band *
                  </label>
                  <select
                    id="income_band"
                    value={formData.income_band}
                    onChange={(e) => setFormData({ ...formData, income_band: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', background: 'white' }}
                    required
                  >
                    <option value="">Select income band</option>
                    <option value="small">Under £100,000</option>
                    <option value="medium">£100,000 - £1 million</option>
                    <option value="large">Over £1 million</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="financial_year_end" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Financial Year End *
                  </label>
                  <select
                    id="financial_year_end"
                    value={formData.financial_year_end}
                    onChange={(e) => setFormData({ ...formData, financial_year_end: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', background: 'white' }}
                    required
                  >
                    <option value="">Select year end</option>
                    <option value="31-03">31st March (Most Common)</option>
                    <option value="31-12">31st December</option>
                    <option value="31-01">31st January</option>
                    <option value="01-04">1st April</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Contact Information</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor="primary_email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Primary Email *
                  </label>
                  <input
                    id="primary_email"
                    type="email"
                    value={formData.primary_email}
                    onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    placeholder="info@charity.org"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    placeholder="020 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="website" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  placeholder="https://www.charity.org"
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Address</h3>
              
              <input
                id="address_line1"
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                placeholder="Street address"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  placeholder="City"
                />

                <input
                  id="postcode"
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  placeholder="Postcode"
                />
              </div>
            </div>

            {error && (
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                color: '#dc2626', 
                padding: '0.75rem 1rem', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {debugInfo && debugInfo.success && (
              <div style={{ 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                color: '#166534', 
                padding: '0.75rem 1rem', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{debugInfo.message}</span>
              </div>
            )}
            
            {debugInfo && !debugInfo.success && process.env.NODE_ENV === 'development' && (
              <details style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.75rem' }}>
                <summary style={{ fontWeight: '600', marginBottom: '0.5rem', cursor: 'pointer' }}>Debug Information (Development Only)</summary>
                <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', marginTop: '0.5rem' }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{ 
                width: '100%', 
                background: isLoading ? '#d1d5db' : '#B1FA63', 
                color: isLoading ? '#6b7280' : '#243837', 
                padding: '0.75rem 1rem', 
                borderRadius: '0.5rem', 
                fontWeight: '500', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating your organization...
                </>
              ) : (
                <>
                  Complete Setup
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}