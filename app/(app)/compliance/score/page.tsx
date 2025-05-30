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
      {/* Header Section with Consistent Pattern */}
      <div className="bg-gradient-to-br from-[#B1FA63]/5 via-[#B1FA63]/3 to-transparent rounded-xl p-6 border border-[#B1FA63]/20 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-[#243837] rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="h-6 w-6 text-[#B1FA63]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-light text-gray-900 leading-tight tracking-tight">
              Compliance Score
            </h1>
            <p className="text-base text-gray-700 leading-relaxed mt-2">
              Monitor your charity&apos;s overall compliance health and identify areas for improvement.
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
        <ComplianceScoreContent />
      </Suspense>
    </div>
  )
}
