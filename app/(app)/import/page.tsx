'use client'

import { useState } from 'react'
import { ImportQueue } from '@/features/ai/components/import-queue'
import { ExtractionReview } from '@/features/ai/components/extraction-review'
import { CSVImportWizard } from '@/features/ai/components/csv-import-wizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  Mail, 
  Upload, 
  Sparkles,
  Info,
  Copy,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function ImportPage() {
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null)
  const [inboxEmail, setInboxEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showCSVWizard, setShowCSVWizard] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  // Generate unique inbox email for this organization
  // In real app, this would come from the user's organization data
  const generateInboxEmail = () => {
    // Mock organization ID
    const orgId = 'abc123'
    return `org-${orgId}@inbox.charityprep.com`
  }

  const handleImportComplete = () => {
    setSelectedImportId(null)
    // Refresh the queue
    window.location.reload()
  }

  const handleCopyEmail = () => {
    const email = inboxEmail || generateInboxEmail()
    navigator.clipboard.writeText(email)
    setCopied(true)
    toast.success('Email address copied!')
    setTimeout(() => setCopied(false), 3000)
  }

  const handleCSVImportComplete = async (importedCount: number, totalCount: number, type: string) => {
    setShowCSVWizard(false)
    toast.success(`Successfully imported ${importedCount} of ${totalCount} ${type} records`)
    // Refresh the import queue
    window.location.reload()
  }

  const handleFileUpload = async (file: File) => {
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not authenticated')
      return
    }
    
    // Get organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
      
    if (!membership) {
      toast.error('No organization found')
      return
    }
    
    // Upload file to storage
    const fileName = `imports/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      toast.error('Failed to upload file')
      return
    }

    // Create AI task for extraction
    const { error: taskError } = await supabase
      .from('ai_tasks' as any)
      .insert({
        organization_id: membership.organization_id,
        task_type: 'extract',
        status: 'pending',
        input_data: {
          file_path: fileName,
          file_type: file.type,
          file_name: file.name,
          source: 'manual_upload'
        }
      } as any)

    if (taskError) {
      toast.error('Failed to create extraction task')
      return
    }

    toast.success('File uploaded! AI extraction will begin shortly.')
    setShowUploadDialog(false)
    // Refresh the queue
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Smart Import
          </h1>
          <p className="text-muted-foreground mt-1">
            Import data automatically from emails and documents using AI
          </p>
        </div>

        {/* Inbox Setup Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Your Magic Inbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Forward emails with documents to automatically extract and import data:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background rounded-md text-sm font-mono">
                  {inboxEmail || generateInboxEmail()}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyEmail}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                <span>
                  Supports: DBS certificates, donation receipts, expense receipts, overseas transfer confirmations
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Queue */}
        <div className="h-[700px]">
          <ImportQueue onSelectImport={setSelectedImportId} />
        </div>

        {/* Extraction Review */}
        <div className="h-[700px]">
          <ExtractionReview 
            importId={selectedImportId}
            onComplete={handleImportComplete}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setShowUploadDialog(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Upload Document</h3>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or browse
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Email Import</h3>
                <p className="text-sm text-muted-foreground">
                  Forward to inbox
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setShowCSVWizard(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">CSV Import</h3>
                <p className="text-sm text-muted-foreground">
                  AI column mapping
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSV Import Wizard Dialog */}
      <Dialog open={showCSVWizard} onOpenChange={setShowCSVWizard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <CSVImportWizard
            onComplete={handleCSVImportComplete}
            onCancel={() => setShowCSVWizard(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Upload Document</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a document for AI extraction
              </p>
            </div>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file)
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to browse or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  PDF, PNG, JPG up to 10MB
                </span>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}