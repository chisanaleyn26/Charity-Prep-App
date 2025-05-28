import { Suspense } from 'react'
import { Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSafeguardingRecords } from '@/features/compliance/actions/safeguarding'
import { getUserOrganization, debugGetUserOrganization } from '@/features/compliance/services/safeguarding.service'
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

  // Debug: Get raw response to investigate the issue
  const debugResponse = await debugGetUserOrganization(user.id)
  
  // If this is a debug response, show it
  if (debugResponse.debug) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Debug Information</h2>
        <pre className="bg-white p-4 rounded border overflow-auto text-sm">
          {JSON.stringify(debugResponse, null, 2)}
        </pre>
        <p className="mt-4 text-sm text-gray-600">
          This debug information shows the current user and organization state. 
          Please share this with technical support.
        </p>
      </div>
    )
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
              <Shield className="h-12 w-12 text-gray-600" />
              Safeguarding
            </h1>
            <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
              Manage DBS checks and safeguarding compliance for all staff and volunteers.
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
          <SafeguardingContent />
        </Suspense>
      </div>
  )
}