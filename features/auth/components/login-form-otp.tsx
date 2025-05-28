'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, Shield, CheckCircle } from 'lucide-react'
import { EtherealCard, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { EmailStep } from './email-step'
import { OTPInputField } from './otp-input'
import { useOTPTimer, useOTPAttempts } from '../hooks/use-otp-timer'
import { sendOTP, verifyOTP, resendOTP } from '../actions/auth'
import { LoadingSpinner } from '@/components/common/loading-spinner'

type LoginStep = 'email' | 'otp'

/**
 * Complete OTP login form with email and verification steps
 * Handles the entire authentication flow with proper error handling and UX
 */
export function LoginFormOTP() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // OTP timer and attempts management
  const { 
    timeLeft, 
    canResend, 
    startTimer, 
    formatTime 
  } = useOTPTimer({ 
    initialTime: 60,
    onTimerEnd: () => {
      // Timer ended callback if needed
    }
  })
  
  const {
    attemptCount,
    canRequestOTP,
    recordAttempt,
    getRemainingCooldown
  } = useOTPAttempts()

  // Clear error when step changes
  useEffect(() => {
    setError(null)
  }, [step])

  // Handle email submission
  const handleEmailSubmit = useCallback(async (submittedEmail: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await sendOTP({ email: submittedEmail })
      
      if (!result.success) {
        setError(result.error || 'Failed to send verification code')
        if (result.cooldownSeconds) {
          // Start timer with remaining cooldown
          startTimer()
        }
        return
      }
      
      // Success - move to OTP step
      setEmail(submittedEmail)
      setStep('otp')
      startTimer() // Start resend cooldown timer
      recordAttempt() // Record attempt for rate limiting
      
      toast.success('Verification code sent to your email')
    } catch (err) {
      console.error('Email submission error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [startTimer, recordAttempt])

  // Handle OTP verification
  const handleOTPComplete = useCallback(async (code: string) => {
    if (code.length !== 6) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await verifyOTP({ email, otp: code })
      
      if (!result.success) {
        setError(result.error || 'Invalid verification code')
        setOTP('') // Clear OTP input
        return
      }
      
      // Success - redirect
      toast.success('Welcome back!')
      router.push(result.redirectPath || '/dashboard')
    } catch (err) {
      console.error('OTP verification error:', err)
      setError('Verification failed. Please try again.')
      setOTP('') // Clear OTP input
    } finally {
      setIsLoading(false)
    }
  }, [email, router])

  // Handle OTP resend
  const handleResendOTP = useCallback(async () => {
    if (!canResend || !canRequestOTP()) {
      const cooldown = getRemainingCooldown()
      if (cooldown > 0) {
        toast.error(`Please wait ${Math.ceil(cooldown / 60)} minutes before requesting a new code`)
        return
      }
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await resendOTP({ email })
      
      if (!result.success) {
        setError(result.error || 'Failed to resend code')
        if (result.cooldownSeconds) {
          toast.error(`Too many attempts. Please wait ${Math.ceil(result.cooldownSeconds / 60)} minutes.`)
        }
        return
      }
      
      // Success
      startTimer() // Restart cooldown timer
      recordAttempt() // Record resend attempt
      setOTP('') // Clear OTP input
      toast.success('New verification code sent')
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError('Failed to resend code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [email, canResend, canRequestOTP, getRemainingCooldown, startTimer, recordAttempt])

  // Handle back navigation
  const handleBack = useCallback(() => {
    setStep('email')
    setOTP('')
    setError(null)
  }, [])

  return (
    <EtherealCard variant="elevated" className="w-full max-w-md mx-auto">
      <EtherealCardContent className="p-6 sm:p-8">
        {step === 'email' ? (
          <EmailStep
            onSubmit={handleEmailSubmit}
            isLoading={isLoading}
            error={error || undefined}
            defaultEmail={email}
          />
        ) : (
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="flex items-center gap-1 text-sm text-[#616161] hover:text-[#243837] transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to email</span>
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-[#B1FA63]/20 mb-2">
                <Shield className="h-6 w-6 text-[#B1FA63]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#243837]">
                Enter verification code
              </h2>
              <p className="text-[#616161]">
                We sent a code to{' '}
                <span className="font-medium text-[#243837]">{email}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-4">
              <OTPInputField
                value={otp}
                onChange={setOTP}
                onComplete={handleOTPComplete}
                disabled={isLoading}
                error={!!error}
                errorMessage={error || undefined}
                helperText="Enter the 6-digit code from your email"
                autoFocus
              />

              {/* Verify button (optional - OTP auto-submits on complete) */}
              <EtherealButton
                onClick={() => handleOTPComplete(otp)}
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" variant="dark" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </EtherealButton>

              {/* Resend section */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading || !canRequestOTP()}
                    className="text-sm text-[#B1FA63] hover:underline font-medium disabled:opacity-50 disabled:no-underline"
                  >
                    Didn't receive the code? Resend
                  </button>
                ) : (
                  <p className="text-sm text-[#616161]">
                    Resend code in <span className="font-medium">{formatTime(timeLeft)}</span>
                  </p>
                )}
                
                {attemptCount >= 3 && (
                  <p className="text-xs text-red-500 mt-2">
                    Too many attempts. You may experience longer wait times.
                  </p>
                )}
              </div>
            </div>

            {/* Security info */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-[#616161] text-center">
                For security, codes expire after 5 minutes. Having trouble?{' '}
                <a href="/help" className="text-[#B1FA63] hover:underline">
                  Get help
                </a>
              </p>
            </div>
          </div>
        )}
      </EtherealCardContent>
    </EtherealCard>
  )
}