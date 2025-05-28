import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayoutClient } from './layout-client'

// MOCK MODE - Set to false to use real authentication
const MOCK_MODE = true

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Mock organization for development
  const mockOrganization = {
    id: 'mock-org-123',
    name: 'Example Charity Foundation',
    charity_number: '1234567',
    year_end: '03-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (MOCK_MODE) {
    return (
      <AppLayoutClient organization={mockOrganization}>
        {children}
      </AppLayoutClient>
    )
  }

  // Real authentication flow
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    // User has no organization, redirect to onboarding
    // Skip redirect in mock mode to prevent loops
    if (!MOCK_MODE) {
      redirect('/onboarding')
    }
    // In mock mode, use the mock organization
    return (
      <AppLayoutClient organization={mockOrganization}>
        {children}
      </AppLayoutClient>
    )
  }

  return (
    <AppLayoutClient organization={membership.organization}>
      {children}
    </AppLayoutClient>
  )
}