'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EtherealCard, EtherealCardHeader, EtherealCardTitle, EtherealCardDescription, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { EtherealInput } from '@/components/custom-ui/ethereal-input'
import { Label } from '@/components/ui/label'
import { Mail, Sparkles } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/loading-spinner'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Call the sign-in server action
      const { signIn } = await import('@/lib/api/auth')
      const result = await signIn({ email })

      if (result.error) {
        setError(result.error)
      } else {
        // Redirect to verify page
        router.push('/verify?email=' + encodeURIComponent(email))
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <EtherealCard variant="elevated">
      <EtherealCardHeader className="text-center">
        <div className="inline-flex p-3 rounded-full bg-[#B1FA63]/20 mb-4 mx-auto">
          <Mail className="h-6 w-6 text-[#B1FA63]" />
        </div>
        <EtherealCardTitle className="text-3xl">Welcome back</EtherealCardTitle>
        <EtherealCardDescription className="text-base">
          Enter your email to receive a magic link. No password needed!
        </EtherealCardDescription>
      </EtherealCardHeader>
      <EtherealCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                Sending magic link...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Send Magic Link
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
      </EtherealCardContent>
    </EtherealCard>
  )
}