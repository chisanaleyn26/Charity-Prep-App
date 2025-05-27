import { Suspense } from 'react'
import BoardPack from '@/features/reports/board-pack/components/BoardPack'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Card } from '@/components/ui/card'

export default function BoardPackPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Board Pack Generator</h1>
        <p className="text-muted-foreground">
          Create customizable board reports with compliance insights and AI-generated narratives
        </p>
      </div>

      <Suspense
        fallback={
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-2">Loading board pack generator...</span>
            </div>
          </Card>
        }
      >
        <BoardPack />
      </Suspense>
    </div>
  )
}