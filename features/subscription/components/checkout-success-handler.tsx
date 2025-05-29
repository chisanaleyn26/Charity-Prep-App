'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function CheckoutSuccessHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    const syncSubscription = async (sessionId: string) => {
      setIsSyncing(true)
      try {
        const response = await fetch('/api/billing/sync-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })

        const data = await response.json()

        if (response.ok) {
          toast.success('Subscription activated successfully! Welcome to Charity Prep.')
          // Reload to refresh subscription status
          window.location.href = '/settings/billing'
        } else {
          toast.error('Failed to activate subscription', {
            description: data.error || 'Please contact support if the issue persists.'
          })
          router.replace('/settings/billing')
        }
      } catch (error) {
        console.error('Sync error:', error)
        toast.error('Failed to sync subscription', {
          description: 'Please refresh the page or contact support.'
        })
        router.replace('/settings/billing')
      } finally {
        setIsSyncing(false)
      }
    }

    if (success === 'true' && sessionId) {
      // Sync the subscription from Stripe
      syncSubscription(sessionId)
    } else if (canceled === 'true') {
      toast.info('Checkout canceled. You can upgrade anytime from your billing settings.')
      // Clear the query params
      router.replace('/settings/billing')
    }
  }, [searchParams, router])

  if (isSyncing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card p-6 rounded-lg shadow-lg flex items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Activating your subscription...</p>
        </div>
      </div>
    )
  }

  return null
}