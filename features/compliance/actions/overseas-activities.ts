'use server'

import { createClient } from '@/lib/supabase/server'
import { overseasActivitySchema } from '../types/overseas-activities'
import { revalidatePath } from 'next/cache'

export async function createOverseasActivity(formData: FormData) {
  const supabase = await createClient()
  
  const rawData = {
    country: formData.get('country') as string,
    activity_type: formData.get('activity_type') as string,
    description: formData.get('description') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    status: formData.get('status') as string,
    annual_spend: formData.get('annual_spend') ? Number(formData.get('annual_spend')) : null,
    partner_organization: formData.get('partner_organization') as string || null,
    risk_assessment_date: formData.get('risk_assessment_date') as string || null,
    risk_level: formData.get('risk_level') as string || null,
    compliance_notes: formData.get('compliance_notes') as string || null,
  }

  const validated = overseasActivitySchema.safeParse(rawData)
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
    .from('overseas_activities')
    .insert({
      ...validated.data,
      organization_id: membership.organization_id
    } as any)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/overseas-activities')
  return { data }
}

export async function updateOverseasActivity(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const rawData = {
    country: formData.get('country') as string,
    activity_type: formData.get('activity_type') as string,
    description: formData.get('description') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    status: formData.get('status') as string,
    annual_spend: formData.get('annual_spend') ? Number(formData.get('annual_spend')) : null,
    partner_organization: formData.get('partner_organization') as string || null,
    risk_assessment_date: formData.get('risk_assessment_date') as string || null,
    risk_level: formData.get('risk_level') as string || null,
    compliance_notes: formData.get('compliance_notes') as string || null,
  }

  const validated = overseasActivitySchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { data, error } = await supabase
    .from('overseas_activities')
    .update(validated.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/overseas-activities')
  return { data }
}

export async function deleteOverseasActivity(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('overseas_activities')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/overseas-activities')
  return { success: true }
}

export async function updateComplianceStatus(id: string, sanctionsCompleted: boolean, reportingRequired: boolean) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('overseas_activities')
    .update({
      sanctions_check_completed: sanctionsCompleted,
      requires_reporting: reportingRequired
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/overseas-activities')
  return { data }
}