'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FormErrorBoundary } from '@/components/common/error-boundary'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { createSafeguardingRecord, updateSafeguardingRecord } from '../../services/safeguarding-aligned'
import type { SafeguardingRecord, SafeguardingRoleType, DBSCheckType } from '../../types/safeguarding-aligned'

// Enhanced validation schema
const safeguardingFormSchema = z.object({
  person_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
  
  dbs_certificate_number: z.string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), 'DBS certificate number must be exactly 12 digits'),
  
  role_title: z.string()
    .min(2, 'Role title must be at least 2 characters')
    .max(100, 'Role title must be less than 100 characters'),
  
  role_type: z.enum(['employee', 'volunteer', 'trustee', 'contractor'], {
    required_error: 'Please select a role type'
  }),
  
  department: z.string()
    .max(100, 'Department name must be less than 100 characters')
    .optional(),
  
  dbs_check_type: z.enum(['basic', 'standard', 'enhanced', 'enhanced_barred'], {
    required_error: 'Please select a DBS check type'
  }),
  
  issue_date: z.string()
    .min(1, 'Issue date is required')
    .refine((date) => {
      const parsed = new Date(date)
      const now = new Date()
      return parsed <= now
    }, 'Issue date cannot be in the future'),
  
  expiry_date: z.string()
    .min(1, 'Expiry date is required')
    .refine((date) => {
      const parsed = new Date(date)
      const now = new Date()
      return parsed > now
    }, 'Expiry date must be in the future'),
  
  training_date: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const parsed = new Date(date)
      const now = new Date()
      return parsed <= now
    }, 'Training date cannot be in the future'),
  
  reference_checks_completed: z.boolean().default(false),
  training_completed: z.boolean().default(false),
  works_with_children: z.boolean().default(false),
  works_with_vulnerable_adults: z.boolean().default(false),
  unsupervised_access: z.boolean().default(false),
  is_active: z.boolean().default(true),
  
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
})
.superRefine((data, ctx) => {
  // Cross-field validation: expiry date must be after issue date
  const issueDate = new Date(data.issue_date)
  const expiryDate = new Date(data.expiry_date)
  
  if (expiryDate <= issueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Expiry date must be after issue date',
      path: ['expiry_date']
    })
  }
  
  // If training completed is checked, training date should be provided
  if (data.training_completed && !data.training_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Training date is required when training is marked as completed',
      path: ['training_date']
    })
  }
})

type SafeguardingFormData = z.infer<typeof safeguardingFormSchema>

interface SafeguardingFormEnhancedProps {
  record?: SafeguardingRecord
  onSubmit?: () => void
  onCancel?: () => void
}

export function SafeguardingFormEnhanced({ record, onSubmit, onCancel }: SafeguardingFormEnhancedProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<SafeguardingFormData>({
    resolver: zodResolver(safeguardingFormSchema),
    defaultValues: {
      person_name: record?.person_name || '',
      dbs_certificate_number: record?.dbs_certificate_number || '',
      role_title: record?.role_title || '',
      role_type: record?.role_type || 'employee',
      department: record?.department || '',
      dbs_check_type: record?.dbs_check_type || 'basic',
      issue_date: record?.issue_date ? new Date(record.issue_date).toISOString().split('T')[0] : '',
      expiry_date: record?.expiry_date ? new Date(record.expiry_date).toISOString().split('T')[0] : '',
      training_date: record?.training_date ? new Date(record.training_date).toISOString().split('T')[0] : '',
      reference_checks_completed: record?.reference_checks_completed ?? false,
      training_completed: record?.training_completed ?? false,
      works_with_children: record?.works_with_children ?? false,
      works_with_vulnerable_adults: record?.works_with_vulnerable_adults ?? false,
      unsupervised_access: record?.unsupervised_access ?? false,
      is_active: record?.is_active ?? true,
      notes: record?.notes || ''
    }
  })

  const handleFormSubmit = async (data: SafeguardingFormData) => {
    setIsSubmitting(true)
    
    try {
      const submitData = {
        person_name: data.person_name,
        dbs_certificate_number: data.dbs_certificate_number || null,
        role_title: data.role_title,
        role_type: data.role_type,
        department: data.department || null,
        dbs_check_type: data.dbs_check_type,
        issue_date: new Date(data.issue_date),
        expiry_date: new Date(data.expiry_date),
        reference_checks_completed: data.reference_checks_completed,
        training_completed: data.training_completed,
        training_date: data.training_date ? new Date(data.training_date) : null,
        works_with_children: data.works_with_children,
        works_with_vulnerable_adults: data.works_with_vulnerable_adults,
        unsupervised_access: data.unsupervised_access,
        is_active: data.is_active,
        notes: data.notes || null
      }

      if (record) {
        await updateSafeguardingRecord({ id: record.id, ...submitData })
        toast.success('Safeguarding record updated successfully')
      } else {
        await createSafeguardingRecord(submitData)
        toast.success('Safeguarding record created successfully')
      }
      
      onSubmit?.()
    } catch (error) {
      console.error('Error submitting safeguarding record:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save record. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormErrorBoundary onError={(error) => console.error('Safeguarding form error:', error)}>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="person_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Person Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Role Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Role Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="trustee">Trustee</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* DBS Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">DBS Check Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dbs_check_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DBS Check Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select check type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="enhanced">Enhanced</SelectItem>
                          <SelectItem value="enhanced_barred">Enhanced + Barred List</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dbs_certificate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DBS Certificate Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123456789012 (12 digits)" 
                          {...field} 
                          maxLength={12}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the 12-digit certificate number if available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Training Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Training & References</h3>
              <FormField
                control={form.control}
                name="training_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Completion Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Permissions & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reference_checks_completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Reference Checks Completed</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="training_completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Training Completed</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="works_with_children"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Works with Children</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="works_with_vulnerable_adults"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Works with Vulnerable Adults</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unsupervised_access"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Unsupervised Access</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Record</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum 1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {record ? 'Update' : 'Create'} Record
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </FormErrorBoundary>
  )
}