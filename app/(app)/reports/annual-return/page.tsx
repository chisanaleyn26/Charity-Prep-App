import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Card } from '@/components/ui/card'
import { ARGenerator } from '@/features/reports/annual-return/components/ARGenerator'
import { fetchAnnualReturnData, getUserOrganization } from '@/features/reports/annual-return/services/annual-return.service'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Annual Return Generator</h1>
        <p className="text-muted-foreground">
          Prepare and export your charity&apos;s data for the Charity Commission Annual Return
        </p>
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