'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { EtherealCard, EtherealCardHeader, EtherealCardTitle, EtherealCardDescription, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/loading-spinner'

export function VerifyMessage() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    try {
      // Call the sign-in server action again
      const { signIn } = await import('@/lib/api/auth')
      await signIn({ email })
      setResent(true)
      setTimeout(() => setResent(false), 5000)
    } catch (err) {
      console.error('Failed to resend:', err)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <EtherealCard variant="elevated">
      <EtherealCardHeader className="text-center">
        <div className="inline-flex p-4 rounded-full bg-[#B1FA63]/20 mb-6 mx-auto">
          <Mail className="h-8 w-8 text-[#B1FA63]" />
        </div>
        <EtherealCardTitle className="text-3xl">Check your email</EtherealCardTitle>
        <EtherealCardDescription className="text-base">
          We&apos;ve sent a magic link to{' '}
          <span className="font-medium text-[#243837]">{email}</span>
        </EtherealCardDescription>
      </EtherealCardHeader>
      <EtherealCardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-[#243837] flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#B1FA63]" />
            What to do next:
          </h3>
          <ol className="space-y-2 text-sm text-[#616161] ml-7">
            <li>1. Open the email from Charity Prep</li>
            <li>2. Click the magic link inside</li>
            <li>3. You&apos;ll be automatically signed in</li>
          </ol>
        </div>

        {/* Resend button */}
        <div className="text-center space-y-2">
          {resent ? (
            <p className="text-sm text-[#B1FA63] font-medium">
              ✓ Email resent successfully!
            </p>
          ) : (
            <>
              <p className="text-sm text-[#616161]">
                Didn&apos;t receive the email?
              </p>
              <EtherealButton
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <LoadingSpinner size="sm" variant="dark" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend magic link
                  </>
                )}
              </EtherealButton>
            </>
          )}
        </div>

        {/* Help text */}
        <div className="border-t border-[#E0E0E0] pt-4">
          <p className="text-xs text-[#616161] text-center">
            Magic links expire after 1 hour for security. If you&apos;re having trouble,{' '}
            <a href="#support" className="text-[#B1FA63] hover:underline">
              contact support
            </a>
          </p>
        </div>
      </EtherealCardContent>
    </EtherealCard>
  )
}