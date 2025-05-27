import { Suspense } from 'react'
import { CertificatesGallery } from '@/features/reports/components/certificates-gallery'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Card } from '@/components/ui/card'

export default function CertificatesPage() {
  return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Compliance Certificates</h1>
          <p className="text-muted-foreground">
            Celebrate and share your compliance achievements
          </p>
        </div>

        <Suspense
          fallback={
            <Card className="p-8">
              <div className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2">Loading certificates...</span>
              </div>
            </Card>
          }
        >
          <CertificatesGallery />
        </Suspense>
      </div>
  )
}