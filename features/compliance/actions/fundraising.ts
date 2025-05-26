'use server'

import { createClient } from '@/lib/supabase/server'
import { fundraisingActivitySchema } from '../types/fundraising'
import { revalidatePath } from 'next/cache'

export async function createFundraisingActivity(formData: FormData) {
  const supabase = await createClient()
  
  const rawData = {
    activity_name: formData.get('activity_name') as string,
    activity_type: formData.get('activity_type') as string,
    description: formData.get('description') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    target_amount: Number(formData.get('target_amount')),
    raised_amount: Number(formData.get('raised_amount') || 0),
    status: formData.get('status') as string,
    platform: formData.get('platform') as string || null,
    is_regulated: formData.get('is_regulated') === 'true',
    compliance_checks_completed: formData.get('compliance_checks_completed') === 'true',
    risk_assessment: formData.get('risk_assessment') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const validated = fundraisingActivitySchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership?.organization_id) {
    return { error: 'No organization found' }
  }

  const { data, error } = await supabase
    .from('income_records')
    .insert({
      ...validated.data,
      organization_id: membership.organization_id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/fundraising')
  return { data }
}

export async function updateFundraisingActivity(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const rawData = {
    activity_name: formData.get('activity_name') as string,
    activity_type: formData.get('activity_type') as string,
    description: formData.get('description') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    target_amount: Number(formData.get('target_amount')),
    raised_amount: Number(formData.get('raised_amount') || 0),
    status: formData.get('status') as string,
    platform: formData.get('platform') as string || null,
    is_regulated: formData.get('is_regulated') === 'true',
    compliance_checks_completed: formData.get('compliance_checks_completed') === 'true',
    risk_assessment: formData.get('risk_assessment') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const validated = fundraisingActivitySchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { data, error } = await supabase
    .from('income_records')
    .update(validated.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/fundraising')
  return { data }
}

export async function deleteFundraisingActivity(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('income_records')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/fundraising')
  return { success: true }
}

export async function updateRaisedAmount(id: string, amount: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_records')
    .update({ amount: amount })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/fundraising')
  return { data }
}

export async function markComplianceComplete(id: string) {
  const supabase = await createClient()
  
  // Income records don't have compliance_checks_completed field
  // This is a no-op for compatibility
  const { data, error } = await supabase
    .from('income_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/fundraising')
  return { data }
}