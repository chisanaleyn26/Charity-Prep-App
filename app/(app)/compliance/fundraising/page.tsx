import { Suspense } from 'react'
import { DollarSign, TrendingUp, Target, AlertCircle } from 'lucide-react'
import { getFundraisingActivities } from '@/features/compliance/actions/fundraising'
import { getUserOrganization } from '@/features/compliance/services/fundraising.service'
import { createServerClient } from '@/lib/supabase/server'
import FundraisingClient from './fundraising-client'
import { Card, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'

async function FundraisingContent() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  try {
    const { organizationId } = await getUserOrganization(user.id)
    const activities = await getFundraisingActivities()

    return (
      <FundraisingClient 
        initialActivities={activities} 
        organizationId={organizationId}
      />
    )
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Failed to load fundraising data: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
}

export default function FundraisingPage() {
  return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
              <DollarSign className="h-12 w-12 text-gray-600" />
              Fundraising
            </h1>
            <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
              Manage fundraising activities and ensure compliance with regulations.
            </p>
          </div>
        </div>

        <Suspense 
          fallback={
            <Card>
              <CardContent className="p-8">
                <div className="space-y-3">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <FundraisingContent />
        </Suspense>
      </div>
  )
}