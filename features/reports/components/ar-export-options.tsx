'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Download, Mail, FileText, Table, Copy, CheckCircle } from 'lucide-react'
import { AnnualReturnData } from '../services/annual-return-service'
import { ARFieldMapping, exportAsCSV } from '../services/ar-field-mapper'
import { useAuthStore } from '@/stores/auth-store'

interface ARExportOptionsProps {
  arData: AnnualReturnData
  fieldMappings: ARFieldMapping[]
  onExport: () => void
}

export function ARExportOptions({ arData, fieldMappings, onExport }: ARExportOptionsProps) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const organization = useAuthStore(state => state.organization)

  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        onExport()
        break
      case 'pdf':
        // TODO: Implement PDF export
        console.log('PDF export not yet implemented')
        break
      case 'email':
        setEmailDialogOpen(true)
        break
      case 'copy':
        handleCopyAll()
        break
    }
  }

  const handleCopyAll = () => {
    const formattedData = fieldMappings
      .map(field => `${field.fieldName}: ${field.value || 'Not provided'}`)
      .join('\n')
    
    navigator.clipboard.writeText(formattedData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailSend = async () => {
    setSending(true)
    try {
      // TODO: Implement email sending via API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      setEmailDialogOpen(false)
      setRecipientEmail('')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Choose how you'd like to export your Annual Return data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                htmlFor="csv"
                className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50"
              >
                <RadioGroupItem value="csv" id="csv" />
                <div className="space-y-1 leading-none">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    <Label htmlFor="csv" className="cursor-pointer">CSV File</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Download all fields in spreadsheet format
                  </p>
                </div>
              </label>

              <label
                htmlFor="pdf"
                className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50"
              >
                <RadioGroupItem value="pdf" id="pdf" />
                <div className="space-y-1 leading-none">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <Label htmlFor="pdf" className="cursor-pointer">PDF Report</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Formatted report for printing or sharing
                  </p>
                </div>
              </label>

              <label
                htmlFor="email"
                className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50"
              >
                <RadioGroupItem value="email" id="email" />
                <div className="space-y-1 leading-none">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email" className="cursor-pointer">Email to Trustees</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send a summary to your board members
                  </p>
                </div>
              </label>

              <label
                htmlFor="copy"
                className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50"
              >
                <RadioGroupItem value="copy" id="copy" />
                <div className="space-y-1 leading-none">
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    <Label htmlFor="copy" className="cursor-pointer">Copy All Fields</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Copy all data to clipboard for pasting
                  </p>
                </div>
              </label>
            </div>
          </RadioGroup>

          <div className="flex justify-end">
            <Button onClick={handleExport} size="lg">
              {copied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Annual Return Data</DialogTitle>
            <DialogDescription>
              Send a summary of your Annual Return data to trustees or team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                type="email"
                placeholder="trustee@charity.org"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm">
                <strong>Subject:</strong> Annual Return Data - {organization?.name}
              </p>
              <p className="text-sm mt-2">
                <strong>Preview:</strong> This email will contain a summary of your Annual Return data
                including completion status and all field values.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEmailSend} disabled={!recipientEmail || sending}>
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}