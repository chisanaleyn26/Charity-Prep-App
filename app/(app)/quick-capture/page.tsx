'use client'

import { useState } from 'react'
import { DocumentExtractor } from '@/features/ai/components/document-extractor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  FileImage,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function QuickCapturePage() {
  const router = useRouter()
  const [capturedData, setCapturedData] = useState<any>(null)
  const [documentType, setDocumentType] = useState<string>('auto')

  const documentTypes = [
    { id: 'dbs_certificate', label: 'DBS Certificate', icon: FileImage },
    { id: 'receipt', label: 'Receipt/Expense', icon: FileImage },
    { id: 'donation_letter', label: 'Donation Letter', icon: FileImage },
    { id: 'bank_statement', label: 'Bank Statement', icon: FileImage },
    { id: 'auto', label: 'Auto-detect', icon: Sparkles }
  ]

  const handleExtractComplete = (data: any) => {
    setCapturedData(data)
    toast.success('Document captured successfully!')
  }

  const handleSaveData = () => {
    // In a real app, this would save the data to the appropriate table
    // based on the document type
    toast.success('Data saved successfully!')
    router.push('/import')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Quick Capture</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Take a photo or upload a document to instantly extract and save compliance data
        </p>
      </div>

      {/* Document Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Type</CardTitle>
          <CardDescription>
            Select the type of document for better extraction accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {documentTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setDocumentType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    documentType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">{type.label}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Document Extractor */}
      <DocumentExtractor
        onExtractComplete={handleExtractComplete}
        documentType={documentType === 'auto' ? undefined : documentType}
      />

      {/* Extracted Data Summary */}
      {capturedData && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Data Extracted Successfully
              </CardTitle>
              <Badge className="bg-green-100 text-green-800">
                Ready to Save
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Show key extracted fields */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(capturedData).slice(0, 6).map(([key, value]) => {
                  if (key === 'confidence') return null
                  return (
                    <div key={key} className="bg-background p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {value as string || '-'}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setCapturedData(null)}
                  className="flex-1"
                >
                  Capture Another
                </Button>
                <Button
                  onClick={handleSaveData}
                  className="flex-1"
                >
                  Save & Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Capture Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-medium mb-1">Good Lighting</p>
                <p className="text-muted-foreground">Ensure the document is well-lit and shadows are minimized</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-medium mb-1">Flat Surface</p>
                <p className="text-muted-foreground">Place documents on a flat surface to avoid distortion</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-medium mb-1">Full Document</p>
                <p className="text-muted-foreground">Capture the entire document including all edges</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}