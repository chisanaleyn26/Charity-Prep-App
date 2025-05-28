'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function CheckoutSuccessHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    if (success === 'true' && sessionId) {
      toast.success('Subscription activated successfully! Welcome to Charity Prep.')
      // Clear the query params
      router.replace('/settings/billing')
    } else if (canceled === 'true') {
      toast.info('Checkout canceled. You can upgrade anytime from your billing settings.')
      // Clear the query params
      router.replace('/settings/billing')
    }
  }, [searchParams, router])

  return null
}