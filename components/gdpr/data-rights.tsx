'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Trash2, Eye, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DataRequest {
  type: 'export' | 'deletion' | 'correction' | 'access'
  reason?: string
  specificData?: string[]
  confirmation?: boolean
}

export function DataRightsPanel() {
  const [isExporting, setIsExporting] = useState(false)
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([])

  const dataTypes = [
    { id: 'personal', label: 'Personal Information', description: 'Name, email, contact details' },
    { id: 'activity', label: 'Activity Data', description: 'Usage patterns, login history' },
    { id: 'documents', label: 'Uploaded Documents', description: 'Files and attachments' },
    { id: 'compliance', label: 'Compliance Records', description: 'DBS checks, safeguarding data' },
    { id: 'financial', label: 'Financial Data', description: 'Donation records, payments' },
    { id: 'communications', label: 'Communications', description: 'Messages, notifications' },
  ]

  const handleDataExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataTypes: selectedDataTypes.length > 0 ? selectedDataTypes : undefined
        })
      })

      if (!response.ok) {
        throw new Error('Export request failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `charity-prep-data-export-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Data export completed successfully')
    } catch (error) {
      toast.error('Failed to export data. Please try again.')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleAccountDeletion = async () => {
    if (!deletionReason.trim()) {
      toast.error('Please provide a reason for account deletion')
      return
    }

    try {
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: deletionReason,
          dataTypes: selectedDataTypes
        })
      })

      if (!response.ok) {
        throw new Error('Deletion request failed')
      }

      toast.success('Account deletion request submitted. You will receive a confirmation email.')
      setIsDeletionDialogOpen(false)
    } catch (error) {
      toast.error('Failed to submit deletion request. Please contact support.')
      console.error('Deletion error:', error)
    }
  }

  const handleDataCorrection = async () => {
    try {
      // Redirect to profile/account settings for data correction
      window.location.href = '/settings/profile'
    } catch (error) {
      toast.error('Unable to access profile settings')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-inchworm" />
        <div>
          <h2 className="text-xl font-semibold text-gunmetal">Your Data Rights</h2>
          <p className="text-muted-foreground">
            Manage your personal data and exercise your GDPR rights
          </p>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Under GDPR, you have the right to access, correct, export, or delete your personal data. 
          All requests are processed securely and in compliance with data protection regulations.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Data Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Export Your Data</CardTitle>
            </div>
            <CardDescription>
              Download a copy of all your personal data stored in our system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select data to export:</label>
              <div className="space-y-2">
                {dataTypes.map((type) => (
                  <label key={type.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedDataTypes.includes(type.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDataTypes(prev => [...prev, type.id])
                        } else {
                          setSelectedDataTypes(prev => prev.filter(id => id !== type.id))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <div>
                      <span className="text-sm font-medium">{type.label}</span>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <Button 
              onClick={handleDataExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Preparing Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Export includes all selected data in JSON and CSV formats. 
              Large exports may take a few minutes to prepare.
            </p>
          </CardContent>
        </Card>

        {/* Data Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">View Your Data</CardTitle>
            </div>
            <CardDescription>
              Access and review what personal information we have about you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Profile Information</span>
                <Badge variant="outline">Complete</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Activity History</span>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Document Records</span>
                <Badge variant="outline">Accessible</Badge>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/settings/privacy'}
              variant="outline"
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Data Summary
            </Button>
          </CardContent>
        </Card>

        {/* Data Correction */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Correct Your Data</CardTitle>
            </div>
            <CardDescription>
              Update or correct any inaccurate personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can update most of your information directly in your account settings. 
              For changes to sensitive data, please contact our support team.
            </p>
            <Button 
              onClick={handleDataCorrection}
              variant="outline"
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg text-red-700">Delete Your Account</CardTitle>
            </div>
            <CardDescription>
              Permanently remove your account and associated data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Account deletion is permanent and cannot be undone. 
                We recommend exporting your data first.
              </AlertDescription>
            </Alert>
            
            <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Account Deletion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-700">Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All your data will be permanently removed 
                    from our systems within 30 days.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Reason for deletion (required):
                    </label>
                    <Select onValueChange={setDeletionReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-longer-needed">No longer need the service</SelectItem>
                        <SelectItem value="privacy-concerns">Privacy concerns</SelectItem>
                        <SelectItem value="switching-service">Switching to another service</SelectItem>
                        <SelectItem value="unsatisfied">Unsatisfied with service</SelectItem>
                        <SelectItem value="other">Other reason</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {deletionReason === 'other' && (
                    <div>
                      <label className="text-sm font-medium">
                        Please specify:
                      </label>
                      <Textarea
                        value={deletionReason}
                        onChange={(e) => setDeletionReason(e.target.value)}
                        placeholder="Please tell us why you want to delete your account"
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      Before deletion, we may need to retain certain data for legal compliance 
                      (e.g., financial records for tax purposes). This will be clearly explained 
                      in our response.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeletionDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleAccountDeletion}
                      className="flex-1"
                    >
                      Confirm Deletion
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Need Help?</h4>
              <p className="text-sm text-blue-700 mt-1">
                If you have questions about your data rights or need assistance with any request, 
                please contact our Data Protection Officer at{' '}
                <a href="mailto:privacy@charityprep.co.uk" className="underline">
                  privacy@charityprep.co.uk
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}