import { Suspense } from 'react'
import DataExport from '@/features/reports/export/components/DataExport'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Card } from '@/components/ui/card'

export default function ExportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
        <p className="text-muted-foreground">
          Export your charity data in multiple formats for reporting and analysis
        </p>
      </div>

      <Suspense
        fallback={
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-2">Loading export options...</span>
            </div>
          </Card>
        }
      >
        <DataExport />
      </Suspense>
    </div>
  )
}