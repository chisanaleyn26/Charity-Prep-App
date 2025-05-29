'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import Link from 'next/link'

interface DynamicNavButtonProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost'
  className?: string
  type: 'login' | 'cta' // login button or main CTA button
}

export function DynamicNavButton({ 
  size = 'sm', 
  variant = 'primary', 
  className = '',
  type
}: DynamicNavButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  
  useEffect(() => {
    const supabase = createClient()
    
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    
    checkSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <EtherealButton size={size} variant={variant} className={className} disabled>
        ...
      </EtherealButton>
    )
  }
  
  // Define button content based on type and auth state
  if (type === 'login') {
    if (isAuthenticated) {
      return (
        <EtherealButton size={size} variant={variant} className={className} asChild>
          <Link href="/dashboard">
            Dashboard
          </Link>
        </EtherealButton>
      )
    } else {
      return (
        <EtherealButton size={size} variant={variant} className={className} asChild>
          <Link href="/login">
            Login
          </Link>
        </EtherealButton>
      )
    }
  }
  
  // CTA button
  if (isAuthenticated) {
    return (
      <EtherealButton size={size} variant={variant} className={className} asChild>
        <Link href="/dashboard">
          Go to App
        </Link>
      </EtherealButton>
    )
  } else {
    return (
      <EtherealButton size={size} variant={variant} className={className} asChild>
        <Link href="/login">
          Get Started
        </Link>
      </EtherealButton>
    )
  }
}