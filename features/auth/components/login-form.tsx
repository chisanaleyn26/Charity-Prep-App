'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EtherealCard, EtherealCardHeader, EtherealCardTitle, EtherealCardDescription, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { EtherealInput } from '@/components/custom-ui/ethereal-input'
import { Label } from '@/components/ui/label'
import { Mail, Sparkles } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/loading-spinner'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Check for auth errors in URL params
  useEffect(() => {
    const urlError = searchParams?.get('error')
    if (urlError) {
      setError(decodeURIComponent(urlError))
    }
  }, [searchParams])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Call the sign-in server action to send OTP
      const { signIn } = await import('@/lib/api/auth')
      const result = await signIn({ email })

      if (result.error) {
        setError(result.error)
      } else {
        // Move to OTP verification step
        setStep('otp')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Verify the OTP code
      const { verifyOtp } = await import('@/lib/api/auth')
      const result = await verifyOtp({ email, token })

      if (result.error) {
        setError(result.error)
      } else {
        // Success! The middleware will handle proper redirection
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <EtherealCard variant="elevated">
        <EtherealCardHeader className="text-center">
          <div className="inline-flex p-3 rounded-full bg-[#B1FA63]/20 mb-4 mx-auto">
            <Mail className="h-6 w-6 text-[#B1FA63]" />
          </div>
          <EtherealCardTitle className="text-3xl">
            {step === 'email' ? 'Welcome back' : 'Enter verification code'}
          </EtherealCardTitle>
          <EtherealCardDescription className="text-base">
            {step === 'email' 
              ? 'Enter your email to receive a 6-digit verification code'
              : `We sent a 6-digit code to ${email}`
            }
          </EtherealCardDescription>
        </EtherealCardHeader>
        <EtherealCardContent>
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-[#243837]">
                  Email address
                </Label>
                <EtherealInput
                  id="email"
                  type="email"
                  placeholder="your@charity.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1"
                  variant={error ? 'error' : 'default'}
                />
                {error && (
                  <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
                )}
              </div>

              <EtherealButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" variant="dark" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </EtherealButton>

              <div className="text-center text-sm text-[#616161]">
                <p>
                  Don&apos;t have an account?{' '}
                  <a href="/login" className="text-[#B1FA63] hover:underline">
                    Start your free trial
                  </a>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <Label htmlFor="token" className="text-[#243837]">
                  Verification code
                </Label>
                <EtherealInput
                  id="token"
                  type="text"
                  placeholder="123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1 text-center text-2xl tracking-widest"
                  variant={error ? 'error' : 'default'}
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                {error && (
                  <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
                )}
              </div>

              <EtherealButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading || token.length !== 6}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" variant="dark" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </EtherealButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setToken('')
                    setError('')
                  }}
                  className="text-sm text-[#616161] hover:text-[#B1FA63] underline"
                >
                  ← Back to email
                </button>
              </div>
            </form>
          )}
        </EtherealCardContent>
      </EtherealCard>
    </div>
  )
}