import { Suspense } from 'react'
import { Globe } from 'lucide-react'
import { getOverseasActivities } from '@/features/compliance/actions/overseas-activities'
import { getUserOrganization } from '@/features/compliance/services/overseas-activities.service'
import { createServerClient } from '@/lib/supabase/server'
import OverseasActivitiesClient from './overseas-activities-client'
import { Card, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'

async function OverseasActivitiesContent() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  try {
    const { organizationId } = await getUserOrganization(user.id)
    const activities = await getOverseasActivities()

    return (
      <OverseasActivitiesClient 
        initialActivities={activities} 
        organizationId={organizationId}
      />
    )
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Failed to load overseas activities: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
}

export default function OverseasActivitiesPage() {
  return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
              <Globe className="h-12 w-12 text-gray-600" />
              Overseas Activities
            </h1>
            <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
              Track and manage your charity&apos;s international operations and compliance.
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
          <OverseasActivitiesContent />
        </Suspense>
      </div>
  )
}