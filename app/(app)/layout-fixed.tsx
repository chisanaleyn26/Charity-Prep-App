import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayoutClient } from './layout-client'
import { getAuthFlow } from '@/features/auth/services/auth-flow.service'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use comprehensive auth flow check
  const authFlow = await getAuthFlow()
  
  // Handle redirects based on auth state
  if (!authFlow.isAuthenticated) {
    redirect('/login')
  }

  if (!authFlow.hasOrganization) {
    redirect('/onboarding')
  }

  // If we have organization but no accepted_at, we still proceed
  // The auth flow service handles this case appropriately
  const organization = authFlow.organization

  if (!organization) {
    // This shouldn't happen if hasOrganization is true, but safeguard
    console.error('🚫 Organization data missing despite hasOrganization=true')
    redirect('/onboarding')
  }
  
  console.log('🏢 Server layout - Organization loaded:', {
    userId: authFlow.user?.id,
    organizationId: organization.id,
    organizationName: organization.name,
    hasAcceptedMembership: authFlow.hasAcceptedMembership,
    membershipStatus: authFlow.membership ? {
      role: authFlow.membership.role,
      acceptedAt: authFlow.membership.accepted_at,
      createdAt: authFlow.membership.created_at
    } : null
  })

  return (
    <AppLayoutClient organization={organization}>
      {children}
    </AppLayoutClient>
  )
}