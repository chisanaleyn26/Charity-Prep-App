'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#B1FA63] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSendOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })
      
      if (otpError) {
        setError(otpError.message)
      } else {
        setStep('otp')
      }
    } catch (err) {
      setError('Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })
      
      if (verifyError) {
        setError(verifyError.message)
      } else if (data?.user) {
        // Check if user has an organization
        const { data: orgs } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', data.user.id)
          .single()
        
        if (orgs?.organization_id) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
    } catch (err) {
      setError('Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-[#B1FA63] rounded-lg flex items-center justify-center">
                <span className="text-[#243837] font-bold text-xl">C</span>
              </div>
              <span className="text-[#243837] font-semibold text-xl tracking-tight">Charity Prep</span>
            </div>
          </div>

          {step === 'email' ? (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-semibold text-[#243837] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-[#87A878] mt-2">
                  Enter your email to sign in to your account
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#243837] mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B1FA63] focus:border-transparent outline-none transition-all text-[#243837] placeholder-gray-400"
                    placeholder="name@charity.org"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-[#E08B8B]">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={loading || !email}
                  className="w-full bg-[#B1FA63] text-[#243837] py-3 px-4 rounded-lg hover:bg-[#9FE851] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#243837] border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Continue with email'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to Charity Prep?</span>
                  </div>
                </div>

                <p className="text-center text-sm text-[#87A878]">
                  Contact us at{' '}
                  <a href="mailto:support@charityprep.uk" className="text-[#243837] hover:text-[#B1FA63] transition-colors">
                    support@charityprep.uk
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <button
                  onClick={() => {
                    setStep('email')
                    setOTP('')
                    setError('')
                  }}
                  className="flex items-center gap-2 text-[#87A878] hover:text-[#243837] transition-colors mb-6"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Back</span>
                </button>
                
                <h1 className="text-3xl font-semibold text-[#243837] tracking-tight">
                  Check your email
                </h1>
                <p className="text-[#87A878] mt-2">
                  We sent a code to {email}
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-[#243837] mb-2">
                    Verification code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B1FA63] focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono outline-none transition-all text-[#243837] placeholder-gray-400"
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-[#E08B8B]">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-[#B1FA63] text-[#243837] py-3 px-4 rounded-lg hover:bg-[#9FE851] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#243837] border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify & sign in'
                  )}
                </button>

                <p className="text-center text-sm text-[#87A878]">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="text-[#243837] hover:text-[#B1FA63] transition-colors font-medium"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#B1FA63]/10 via-white to-[#87A878]/10 items-center justify-center relative overflow-hidden">
        {/* Minimal geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 border border-[#B1FA63]/20 rounded-full" />
          <div className="absolute bottom-20 left-20 w-48 h-48 border border-[#87A878]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-[#B8C5D0]/10 rounded-full" />
        </div>
        
        {/* Central content */}
        <div className="relative z-10 text-center px-12">
          <h2 className="text-4xl font-light text-[#243837] tracking-tight mb-4">
            Compliance made simple
          </h2>
          <p className="text-lg text-[#87A878] font-light">
            Track, manage, and report with confidence
          </p>
          
          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center mt-12">
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#B8C5D0]/30 rounded-full text-sm text-[#243837]">
              Annual returns
            </div>
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#B8C5D0]/30 rounded-full text-sm text-[#243837]">
              DBS tracking
            </div>
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#B8C5D0]/30 rounded-full text-sm text-[#243837]">
              AI-powered
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}