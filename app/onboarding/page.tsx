import { redirect } from 'next/navigation'
import { checkAuthFlow } from '@/lib/api/auth-flow'

export default async function OnboardingPage() {
  // Check if user already has an organization
  const authFlow = await checkAuthFlow()
  
  if (!authFlow.user) {
    redirect('/login')
  }
  
  if (!authFlow.needsOnboarding && authFlow.currentOrganization) {
    // User already has an organization, redirect to dashboard
    redirect('/dashboard')
  }
  
  // If we get here, user truly needs onboarding
  redirect('/onboarding/new')
}