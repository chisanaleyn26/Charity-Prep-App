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
import { FundraisingActivity, FundraisingActivityFormData, incomeRecordSchema } from '../../types/fundraising'
import { createFundraisingActivity, updateFundraisingActivity } from '../../actions/fundraising'
import { FormErrorBoundary } from '@/components/common/error-boundary'

interface FundraisingFormProps {
  activity?: FundraisingActivity
  onSuccess?: () => void
}

export function FundraisingForm({ activity, onSuccess }: FundraisingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(incomeRecordSchema) as any,
    defaultValues: activity ? {
      source: activity.source || 'donations_legacies',
      amount: activity.amount || 0,
      date_received: activity.date_received || new Date().toISOString().split('T')[0],
      financial_year: activity.financial_year || new Date().getFullYear(),
      donor_type: activity.donor_type || 'individual',
      donor_name: activity.donor_name || '',
      is_anonymous: activity.is_anonymous || false,
      fundraising_method: activity.fundraising_method || 'individual_giving',
      campaign_name: activity.campaign_name || '',
      restricted_funds: activity.restricted_funds || false,
      restriction_details: activity.restriction_details || '',
      is_related_party: activity.is_related_party || false,
      related_party_relationship: activity.related_party_relationship || '',
      gift_aid_eligible: activity.gift_aid_eligible || false,
      gift_aid_claimed: activity.gift_aid_claimed || false,
      reference_number: activity.reference_number || '',
      notes: activity.notes || '',
    } : {
      source: 'donations_legacies' as const,
      amount: 0,
      date_received: new Date().toISOString().split('T')[0],
      financial_year: new Date().getFullYear(),
      donor_type: 'individual',
      donor_name: '',
      is_anonymous: false,
      fundraising_method: 'individual_giving',
      campaign_name: '',
      restricted_funds: false,
      restriction_details: '',
      is_related_party: false,
      related_party_relationship: '',
      gift_aid_eligible: false,
      gift_aid_claimed: false,
      reference_number: '',
      notes: '',
    }
  })

  async function onSubmit(data: any) {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString())
        }
      })

      const result = activity
        ? await updateFundraisingActivity(activity.id, formData)
        : await createFundraisingActivity(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(activity ? 'Income record updated successfully' : 'Income record created successfully')
        // Force immediate refresh
        router.refresh()
        // Call success callback to close modal and refresh parent
        onSuccess?.()
      }
    } catch (error) {
      console.error('Fundraising submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save income record')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormErrorBoundary onError={(error) => console.error('Fundraising form error:', error)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income Source</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="donations_legacies">Donations & Legacies</SelectItem>
                    <SelectItem value="charitable_activities">Charitable Activities</SelectItem>
                    <SelectItem value="other_trading">Other Trading</SelectItem>
                    <SelectItem value="investments">Investments</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (£)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_received"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Received</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="financial_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Financial Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="2024"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="donor_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Donor Type (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select donor type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="donor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Donor Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter donor name" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fundraising_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fundraising Method (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual_giving">Individual Giving</SelectItem>
                  <SelectItem value="major_donors">Major Donors</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="trusts_foundations">Trusts & Foundations</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="direct_mail">Direct Mail</SelectItem>
                  <SelectItem value="telephone">Telephone</SelectItem>
                  <SelectItem value="street">Street</SelectItem>
                  <SelectItem value="legacies">Legacies</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="campaign_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Christmas Appeal 2024" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_anonymous"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Anonymous Donation</FormLabel>
                  <FormDescription>
                    Donor wishes to remain anonymous
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="restricted_funds"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Restricted Funds</FormLabel>
                  <FormDescription>
                    Donation has specific restrictions on use
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_related_party"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Related Party Transaction</FormLabel>
                  <FormDescription>
                    Donation from trustee, staff member, or related entity
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gift_aid_eligible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Gift Aid Eligible</FormLabel>
                  <FormDescription>
                    Donor is UK taxpayer and eligible for Gift Aid
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information..."
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activity ? 'Update' : 'Create'} Record
          </Button>
        </div>
      </form>
    </Form>
    </FormErrorBoundary>
  )
}