import { Suspense } from 'react'
import { Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSafeguardingRecords } from '@/features/compliance/actions/safeguarding'
import { getUserOrganization } from '@/features/compliance/services/safeguarding.service'
import SafeguardingClient from './safeguarding-client'
import { Card, CardContent } from '@/components/ui/card'

// Route segment configuration - dynamic content with short cache
export const revalidate = 300 // 5 minutes
export const dynamic = 'force-dynamic' // Always fetch fresh data

async function SafeguardingContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please login to view safeguarding records</div>
  }

  const { organizationId } = await getUserOrganization(user.id)
  const records = await getSafeguardingRecords()

  return (
    <SafeguardingClient 
      initialRecords={records} 
      organizationId={organizationId}
    />
  )
}

export default function SafeguardingPage() {
  return (
      <div className="space-y-8">
        {/* Header Section with Consistent Pattern */}
        <div className="bg-gradient-to-br from-[#B1FA63]/5 via-[#B1FA63]/3 to-transparent rounded-xl p-6 border border-[#B1FA63]/20 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-[#243837] rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-[#B1FA63]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-light text-gray-900 leading-tight tracking-tight">
                Safeguarding
              </h1>
              <p className="text-base text-gray-700 leading-relaxed mt-2">
                Manage DBS checks and safeguarding compliance for all staff and volunteers.
              </p>
            </div>
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
          <SafeguardingContent />
        </Suspense>
      </div>
  )
}