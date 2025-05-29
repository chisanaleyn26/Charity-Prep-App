import { redirect } from 'next/navigation'
import { checkAuthFlow } from '@/lib/api/auth-flow'
import { AppLayoutClient } from './layout-client'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use comprehensive auth flow check
  const authFlow = await checkAuthFlow()
  
  if (!authFlow.user) {
    redirect('/login')
  }

  if (authFlow.needsOnboarding) {
    console.log('🚀 User needs onboarding:', authFlow.user?.id)
    redirect('/onboarding')
  }

  if (!authFlow.currentOrganization) {
    // This shouldn't happen if needsOnboarding check passed
    console.error('❌ No organization found despite passing onboarding check')
    redirect('/onboarding')
  }
  
  console.log('🏢 Server layout - Auth flow complete:', {
    userId: authFlow.user.id,
    organizationId: authFlow.currentOrganization.id,
    organizationName: authFlow.currentOrganization.name,
    totalOrgs: authFlow.organizations.length,
    hasSubscription: authFlow.hasSubscription
  })

  return (
    <AppLayoutClient 
      organization={authFlow.currentOrganization}
      organizations={authFlow.organizations}
      user={authFlow.user}
    >
      {children}
    </AppLayoutClient>
  )
}