'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { EtherealCard, EtherealCardContent } from '@/components/custom-ui/ethereal-card'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // This page handles the auth callback from Supabase
    // The auth is handled by middleware, so we just need to redirect
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <EtherealCard variant="elevated">
      <EtherealCardContent className="text-center py-12">
        <LoadingSpinner size="lg" variant="primary" className="mb-4" />
        <h2 className="text-2xl font-semibold text-[#243837] mb-2">
          Signing you in...
        </h2>
        <p className="text-[#616161]">
          You&apos;ll be redirected to your dashboard in a moment.
        </p>
      </EtherealCardContent>
    </EtherealCard>
  )
}