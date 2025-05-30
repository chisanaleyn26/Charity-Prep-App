import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Card } from '@/components/ui/card'
import { ARGenerator } from '@/features/reports/annual-return/components/ARGenerator'
import { fetchAnnualReturnData, getUserOrganization } from '@/features/reports/annual-return/services/annual-return.service'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'

// Server Component that fetches data
async function AnnualReturnContent() {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  try {
    // Get user's organization
    const membership = await getUserOrganization(user.id)
    
    // Fetch the annual return data on the server
    const data = await fetchAnnualReturnData(membership.organizationId)
    
    // Pass the pre-fetched data to the client component
    return <ARGenerator initialData={data} />
  } catch (error) {
    // If there's an error, pass it to the component
    return <ARGenerator initialError={error instanceof Error ? error.message : 'Failed to load data'} />
  }
}

export default function AnnualReturnPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section with Consistent Pattern */}
      <div className="bg-gradient-to-br from-[#B1FA63]/5 via-[#B1FA63]/3 to-transparent rounded-xl p-6 border border-[#B1FA63]/20 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-[#243837] rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-[#B1FA63]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-light text-gray-900 leading-tight tracking-tight">
              Annual Return Generator
            </h1>
            <p className="text-base text-gray-700 leading-relaxed mt-2">
              Prepare and export your charity&apos;s data for the Charity Commission Annual Return
            </p>
          </div>
        </div>
      </div>

        <Suspense
          fallback={
            <Card className="p-8">
              <div className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2">Loading Annual Return data...</span>
              </div>
            </Card>
          }
        >
          <AnnualReturnContent />
        </Suspense>
    </div>
  )
}