'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Mail,
  Paperclip,
  Edit,
  Save,
  X
} from 'lucide-react'
import { formatDate } from 'date-fns'
import { toast } from 'sonner'
import { markEmailReviewed } from '../services/email-processor'
import { CONFIDENCE_THRESHOLDS } from '@/lib/ai/prompts'

interface ExtractionReviewProps {
  importId: string | null
  onComplete?: () => void
}

export function ExtractionReview({ importId, onComplete }: ExtractionReviewProps) {
  const [emailData, setEmailData] = useState<any>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedData, setEditedData] = useState<any>({})
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (importId) {
      loadEmailData(importId)
    } else {
      setEmailData(null)
      setExtractedData(null)
    }
  }, [importId])

  const loadEmailData = async (id: string) => {
    try {
      setLoading(true)
      // Load email data from Supabase
      // This would be a real API call
      const mockData = {
        id,
        subject: 'DBS Certificate - John Smith',
        from_address: 'hr@example.com',
        received_at: new Date().toISOString(),
        text_content: 'Please find attached the DBS certificate for John Smith...',
        email_type: 'dbs_certificate',
        extracted_data: {
          person_name: 'John Smith',
          dbs_certificate_number: '123456789012',
          issue_date: '2024-01-15',
          dbs_check_type: 'enhanced',
          confidence: 0.85
        },
        attachments: [
          {
            filename: 'dbs-certificate.pdf',
            url: '/sample.pdf'
          }
        ]
      }
      
      setEmailData(mockData)
      setExtractedData(mockData.extracted_data)
      setEditedData(mockData.extracted_data)
    } catch (error) {
      console.error('Failed to load email data:', error)
      toast.error('Failed to load email data')
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          High Confidence ({Math.round(confidence * 100)}%)
        </Badge>
      )
    } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Medium Confidence ({Math.round(confidence * 100)}%)
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Low Confidence ({Math.round(confidence * 100)}%)
        </Badge>
      )
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setEditedData({ ...extractedData })
  }

  const handleSaveEdit = () => {
    setExtractedData(editedData)
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedData(extractedData)
    setEditing(false)
  }

  const handleApprove = async () => {
    if (!importId) return
    
    try {
      // Save the extracted data to the appropriate table
      // This would be based on email_type
      await markEmailReviewed(importId, 'approved', notes)
      toast.success('Import approved and data saved')
      onComplete?.()
    } catch (error) {
      console.error('Failed to approve import:', error)
      toast.error('Failed to approve import')
    }
  }

  const handleReject = async () => {
    if (!importId) return
    
    try {
      await markEmailReviewed(importId, 'rejected', notes)
      toast.success('Import rejected')
      onComplete?.()
    } catch (error) {
      console.error('Failed to reject import:', error)
      toast.error('Failed to reject import')
    }
  }

  if (!importId) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Select an import to review</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading import data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Review Import
            </CardTitle>
            <CardDescription>
              {emailData?.subject || 'No subject'}
            </CardDescription>
          </div>
          {extractedData?.confidence && getConfidenceBadge(extractedData.confidence)}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="extracted" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
            <TabsTrigger value="original">Original Email</TabsTrigger>
            <TabsTrigger value="attachments">
              Attachments {emailData?.attachments?.length > 0 && `(${emailData.attachments.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="extracted" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Extracted Fields</h3>
                  {!editing ? (
                    <Button size="sm" variant="outline" onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Dynamic fields based on email type */}
                {Object.entries(editedData || {}).map(([key, value]) => {
                  if (key === 'confidence') return null
                  
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Label>
                      {editing ? (
                        <Input
                          id={key}
                          value={value as string || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            [key]: e.target.value
                          })}
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded-md">
                          {value || '-'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="original" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div>
                  <Label>From</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {emailData?.from_address}
                  </div>
                </div>
                <div>
                  <Label>Received</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {emailData?.received_at && formatDate(new Date(emailData.received_at), 'PPpp')}
                  </div>
                </div>
                <div>
                  <Label>Content</Label>
                  <div className="p-3 bg-muted rounded-md whitespace-pre-wrap text-sm">
                    {emailData?.text_content}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="attachments" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {emailData?.attachments?.length > 0 ? (
                  emailData.attachments.map((attachment: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{attachment.filename}</p>
                              <p className="text-sm text-muted-foreground">
                                Click to view
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No attachments
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {/* Review Actions */}
        <div className="mt-6 space-y-4 border-t pt-4">
          <div>
            <Label htmlFor="notes">Review Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this import..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              className="flex-1"
              onClick={handleApprove}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}