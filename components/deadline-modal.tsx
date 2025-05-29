'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/features/organizations/components/organization-provider'

interface Deadline {
  id: string
  title: string
  description: string
  date: Date
  type: 'dbs_expiry' | 'annual_return' | 'policy_review' | 'training' | 'other'
  priority: 'high' | 'medium' | 'low'
  status: 'upcoming' | 'overdue' | 'completed'
  relatedUrl?: string
}

interface DeadlineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (deadline: Omit<Deadline, 'id' | 'status'>) => Promise<void>
  initialDate?: Date
}

const deadlineTypes = [
  { value: 'dbs_expiry', label: 'DBS Check Expiry', description: 'Enhanced or standard DBS check renewal' },
  { value: 'annual_return', label: 'Annual Return', description: 'Charity Commission annual return submission' },
  { value: 'policy_review', label: 'Policy Review', description: 'Annual review of policies and procedures' },
  { value: 'training', label: 'Training', description: 'Staff or trustee training requirements' },
  { value: 'other', label: 'Other', description: 'General compliance deadline' }
]

const relatedUrls = {
  dbs_expiry: '/compliance/safeguarding',
  annual_return: '/reports/annual-return',
  policy_review: '/documents',
  training: '/compliance/training',
  other: ''
}

export function DeadlineModal({ open, onOpenChange, onSave, initialDate }: DeadlineModalProps) {
  const { currentOrganization } = useOrganization()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date | undefined>(initialDate)
  const [type, setType] = useState<string>('')
  const [priority, setPriority] = useState<string>('medium')
  const [relatedUrl, setRelatedUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!date) {
      newErrors.date = 'Date is required'
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(date)
      selectedDate.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past'
      }
    }

    if (!type) {
      newErrors.type = 'Type is required'
    }

    if (!priority) {
      newErrors.priority = 'Priority is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    // Auto-populate related URL based on type
    const url = relatedUrls[newType as keyof typeof relatedUrls] || ''
    setRelatedUrl(url)
    
    // Clear type error if it exists
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }))
    }
  }

  const handleSave = async () => {
    console.log('🔄 Save button clicked - starting validation...')
    console.log('🏢 Modal organization check:', currentOrganization?.name, currentOrganization?.id)
    
    if (!currentOrganization) {
      console.log('❌ No organization in modal')
      setSubmitStatus('error')
      setErrorMessage('Organization not loaded. Please refresh the page and try again.')
      return
    }
    
    if (!validateForm()) {
      console.log('❌ Validation failed')
      setSubmitStatus('error')
      setErrorMessage('Please fill in all required fields correctly.')
      return
    }

    console.log('✅ Validation passed - submitting...')
    setIsLoading(true)
    setSubmitStatus('loading')
    setErrorMessage('')

    try {
      const deadlineData = {
        title: title.trim(),
        description: description.trim(),
        date: date!,
        type: type as Deadline['type'],
        priority: priority as Deadline['priority'],
        relatedUrl: relatedUrl.trim() || undefined
      }

      console.log('📤 Calling onSave with data:', deadlineData)
      await onSave(deadlineData)
      
      console.log('🎉 Save successful!')
      setSubmitStatus('success')
      
      // Close modal after a brief success message
      setTimeout(() => {
        handleClose()
      }, 1000)
      
    } catch (error) {
      console.error('💥 Error saving deadline:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save deadline. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setDate(initialDate)
    setType('')
    setPriority('medium')
    setRelatedUrl('')
    setErrors({})
    setIsLoading(false)
    setSubmitStatus('idle')
    setErrorMessage('')
    onOpenChange(false)
  }

  const selectedType = deadlineTypes.find(t => t.value === type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Deadline</DialogTitle>
          <DialogDescription>
            Create a new compliance deadline with details and due date.
          </DialogDescription>
        </DialogHeader>

        {/* Status Message */}
        {submitStatus !== 'idle' && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg",
            submitStatus === 'loading' && "bg-blue-50 text-blue-700",
            submitStatus === 'success' && "bg-green-50 text-green-700",
            submitStatus === 'error' && "bg-red-50 text-red-700"
          )}>
            {submitStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitStatus === 'success' && <CheckCircle className="h-4 w-4" />}
            {submitStatus === 'error' && <AlertCircle className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {submitStatus === 'loading' && 'Saving deadline...'}
              {submitStatus === 'success' && 'Deadline created successfully!'}
              {submitStatus === 'error' && (errorMessage || 'Something went wrong')}
            </span>
          </div>
        )}

        <div className="grid gap-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., DBS Check Renewal - John Smith"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: '' }))
                }
              }}
              className={cn(errors.title && "border-red-500")}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className={cn(errors.type && "border-red-500")}>
                <SelectValue placeholder="Select deadline type" />
              </SelectTrigger>
              <SelectContent>
                {deadlineTypes.map((deadlineType) => (
                  <SelectItem key={deadlineType.value} value={deadlineType.value}>
                    <div>
                      <div className="font-medium">{deadlineType.label}</div>
                      <div className="text-xs text-gray-500">{deadlineType.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.type}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date ? date.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined
                setDate(newDate)
                if (errors.date) {
                  setErrors(prev => ({ ...prev, date: '' }))
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              className={cn(errors.date && "border-red-500")}
            />
            {errors.date && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Priority <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={priority}
              onValueChange={(value) => {
                setPriority(value)
                if (errors.priority) {
                  setErrors(prev => ({ ...prev, priority: '' }))
                }
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="text-sm font-medium text-red-600">High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-sm font-medium text-amber-600">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="text-sm font-medium text-green-600">Low</Label>
              </div>
            </RadioGroup>
            {errors.priority && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.priority}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this deadline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Related URL */}
          <div className="space-y-2">
            <Label htmlFor="relatedUrl" className="text-sm font-medium">Related Page</Label>
            <Input
              id="relatedUrl"
              placeholder="/compliance/safeguarding"
              value={relatedUrl}
              onChange={(e) => setRelatedUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Internal link to related compliance page or document
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSave}
            disabled={isLoading || submitStatus === 'success'}
            className={cn(
              "font-medium transition-all duration-200",
              submitStatus === 'success' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837]"
            )}
          >
            {submitStatus === 'loading' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitStatus === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
            {submitStatus === 'loading' && 'Saving...'}
            {submitStatus === 'success' && 'Saved!'}
            {(submitStatus === 'idle' || submitStatus === 'error') && 'Save Deadline'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}