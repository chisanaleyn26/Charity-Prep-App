import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayoutClient } from './layout-client'
import { appConfig } from '@/lib/config'
import { getDevSession } from '@/lib/dev/dev-auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check for dev mode and auto-login setting
  const isDevMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_AUTO_LOGIN === 'true'
  
  // Check for dev session first
  const devSession = await getDevSession()
  
  if (devSession || isDevMode) {
    // Create mock organization for dev mode
    const mockOrganization = {
      id: 'dev-org-001',
      name: 'Test Charity Foundation',
      charity_number: 'DEV123456',
      website: 'https://charitytest.org',
      email: 'admin@charitytest.org',
      phone: '+44 20 1234 5678',
      address_line1: '123 Test Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom',
      financial_year_end: '2024-03-31',
      charity_type: 'CIO',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      // Add any other required fields
      income_band: 'medium' as const,
      logo_url: null,
      primary_color: '#6366f1',
      settings: {},
      reminder_days_before: 30,
      primary_email: 'admin@charitytest.org',
      address_line2: null,
      status: 'active' as const,
      registration_date: null,
      subscription_tier: 'standard' as const,
      subscription_status: 'active' as const,
      deleted_at: null
    }
    
    // Return layout with mock organization for dev mode (no error boundary)
    return (
      <AppLayoutClient organization={mockOrganization as any}>
        {children}
      </AppLayoutClient>
    )
  }

  // Check mock mode from config
  if (appConfig.features.mockMode) {
    return (
      <AppLayoutClient organization={appConfig.mockData.organization as any}>
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

  if (!membership || !membership.organization) {
    // User has no organization, redirect to onboarding
    redirect('/onboarding')
  }

  return (
    <AppLayoutClient organization={membership.organization}>
      {children}
    </AppLayoutClient>
  )
}