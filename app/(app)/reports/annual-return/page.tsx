import { Suspense } from 'react'
import { ARGenerator } from '@/features/reports/annual-return/components/ARGenerator'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Card } from '@/components/ui/card'

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
        <ARGenerator />
      </Suspense>
    </div>
  )
}