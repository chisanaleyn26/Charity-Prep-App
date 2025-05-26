'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'

// Minimal form that only uses existing schema fields
export function OverseasActivitiesForm({ activity, onSuccess }: any) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm({
    defaultValues: {
      activity_name: '',
      activity_type: 'humanitarian_aid',
      country_code: '',
      amount: 0,
      amount_gbp: 0,
      transfer_date: '',
      transfer_method: 'bank_transfer',
      financial_year: new Date().getFullYear()
    }
  })

  async function onSubmit(data: any) {
    setIsSubmitting(true)
    // Minimal implementation
    toast.success('Feature temporarily disabled')
    onSuccess?.()
    setIsSubmitting(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  )
}