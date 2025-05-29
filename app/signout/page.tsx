'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/common/loading-spinner'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const signOut = async () => {
      try {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.error('Sign out error:', error)
        }
        
        // Always redirect to login, even if there was an error
        setTimeout(() => {
          router.push('/login')
        }, 500)
      } catch (error) {
        console.error('Unexpected sign out error:', error)
        // Still redirect to login
        router.push('/login')
      }
    }

    signOut()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-semibold text-gray-900">Signing out...</h2>
        <p className="text-sm text-gray-600">You will be redirected to the login page.</p>
      </div>
    </div>
  )
}