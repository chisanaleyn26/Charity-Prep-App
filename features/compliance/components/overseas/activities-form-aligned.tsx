'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { OverseasActivity, OverseasActivityFormData, overseasActivitySchema } from '../../types/overseas-activities'
import { createOverseasActivity, updateOverseasActivity } from '../../actions/overseas-activities'
import { countries } from '@/lib/data/countries'
import { FormErrorBoundary } from '@/components/common/error-boundary'

interface OverseasActivitiesFormProps {
  activity?: OverseasActivity
  onSuccess?: () => void
}

export function OverseasActivitiesForm({ activity, onSuccess }: OverseasActivitiesFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OverseasActivityFormData>({
    // resolver: zodResolver(overseasActivitySchema),
    defaultValues: activity ? {
      activity_name: activity.activity_name,
      activity_type: activity.activity_type,
      country_code: activity.country_code,
      partner_id: activity.partner_id,
      amount: activity.amount,
      currency: activity.currency || 'GBP',
      amount_gbp: activity.amount_gbp,
      exchange_rate: activity.exchange_rate,
      transfer_method: activity.transfer_method,
      transfer_date: activity.transfer_date,
      transfer_reference: activity.transfer_reference,
      financial_year: activity.financial_year,
      quarter: activity.quarter,
      beneficiaries_count: activity.beneficiaries_count,
      project_code: activity.project_code,
      description: activity.description,
      sanctions_check_completed: activity.sanctions_check_completed || false,
      requires_reporting: activity.requires_reporting || false,
      reported_to_commission: activity.reported_to_commission || false,
    } : {
      activity_type: 'humanitarian_aid',
      currency: 'GBP',
      amount: 0,
      amount_gbp: 0,
      transfer_method: 'bank_transfer',
      financial_year: new Date().getFullYear(),
      sanctions_check_completed: false,
      requires_reporting: false,
      reported_to_commission: false,
    }
  })

  async function onSubmit(data: OverseasActivityFormData) {
    setIsSubmitting(true)
    
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    const result = activity
      ? await updateOverseasActivity(activity.id, formData)
      : await createOverseasActivity(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(activity ? 'Activity updated successfully' : 'Activity created successfully')
      onSuccess?.()
      router.refresh()
    }

    setIsSubmitting(false)
  }

  return (
    <FormErrorBoundary onError={(error) => console.error('Overseas activities form error:', error)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="activity_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter activity name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="activity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="humanitarian_aid">Humanitarian Aid</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="emergency_relief">Emergency Relief</SelectItem>
                      <SelectItem value="capacity_building">Capacity Building</SelectItem>
                      <SelectItem value="advocacy">Advocacy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Financial Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormDescription>Original currency</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="GBP" maxLength={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount_gbp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (GBP)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormDescription>GBP equivalent</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="exchange_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange Rate (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.000001"
                    placeholder="1.0"
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Transfer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Transfer Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="transfer_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                      <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                      <SelectItem value="cash_courier">Cash Courier</SelectItem>
                      <SelectItem value="money_service_business">Money Service Business</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="informal_value_transfer">Informal Value Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transfer_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="transfer_reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transfer Reference (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Transaction reference" 
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Period Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Period</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="financial_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Year</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={2020}
                      max={2100}
                      onChange={e => field.onChange(e.target.valueAsNumber || new Date().getFullYear())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quarter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quarter (Optional)</FormLabel>
                  <Select 
                    onValueChange={value => field.onChange(value ? Number(value) : null)} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quarter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="1">Q1</SelectItem>
                      <SelectItem value="2">Q2</SelectItem>
                      <SelectItem value="3">Q3</SelectItem>
                      <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="beneficiaries_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiaries Count (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      value={field.value || ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Code (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Project reference" 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe the overseas activity..."
                    className="resize-none"
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Compliance */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Compliance</h3>
          
          <FormField
            control={form.control}
            name="sanctions_check_completed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Sanctions Check Completed</FormLabel>
                  <FormDescription>
                    Confirm sanctions checks have been performed
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requires_reporting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Requires Reporting</FormLabel>
                  <FormDescription>
                    This activity requires reporting to regulators
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reported_to_commission"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Reported to Commission</FormLabel>
                  <FormDescription>
                    Has been reported to the Charity Commission
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activity ? 'Update' : 'Create'} Activity
          </Button>
        </div>
      </form>
    </Form>
    </FormErrorBoundary>
  )
}