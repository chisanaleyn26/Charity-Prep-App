import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayoutClient } from './layout-client'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's organization (use most recent if multiple)
  const { data: memberships } = await supabase
    .from('organization_members')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!memberships || memberships.length === 0 || !memberships[0].organization) {
    // User has no organization, redirect to onboarding
    redirect('/onboarding')
  }
  
  const membership = memberships[0]

  return (
    <AppLayoutClient organization={membership.organization}>
      {children}
    </AppLayoutClient>
  )
}