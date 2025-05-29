'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import Link from 'next/link'

interface DynamicCTAButtonProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'tertiary'
  className?: string
  children?: React.ReactNode
}

export function DynamicCTAButton({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  children 
}: DynamicCTAButtonProps) {
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
  
  // Show loading state or default content while checking auth
  if (isAuthenticated === null) {
    return (
      <EtherealButton size={size} variant={variant} className={className} disabled>
        {children || 'Loading...'}
      </EtherealButton>
    )
  }
  
  // Show same text but different link based on auth state
  const href = isAuthenticated ? '/dashboard' : '/login'
  
  return (
    <EtherealButton size={size} variant={variant} className={className} asChild>
      <Link href={href}>
        {children || 'Get Started'}
      </Link>
    </EtherealButton>
  )
}