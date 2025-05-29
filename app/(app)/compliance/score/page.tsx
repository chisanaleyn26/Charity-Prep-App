import { Suspense } from 'react'
import { Award } from 'lucide-react'
import { getComplianceStatistics } from '@/lib/services/compliance-statistics.service'
import { getCurrentUserOrganization } from '@/lib/supabase/server'
import ComplianceScoreClient from '@/features/compliance/components/score/compliance-score-client'
import { Card, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'

// Route segment configuration - dynamic content with short cache
export const revalidate = 300 // 5 minutes
export const dynamic = 'force-dynamic' // Always fetch fresh data

async function ComplianceScoreContent() {
  const userOrg = await getCurrentUserOrganization()
  
  if (!userOrg) {
    redirect('/login')
  }

  try {
    const statistics = await getComplianceStatistics(userOrg.organizationId)
    
    return (
      <ComplianceScoreClient statistics={statistics} />
    )
  } catch (error) {
    console.error('Error in ComplianceScoreContent:', error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Failed to calculate compliance score</p>
          <p className="text-sm text-gray-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }
}

export default function ComplianceScorePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
            <Award className="h-12 w-12 text-gray-600" />
            Compliance Score
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            Monitor your charity's overall compliance health and identify areas for improvement.
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
        <ComplianceScoreContent />
      </Suspense>
    </div>
  )
}
