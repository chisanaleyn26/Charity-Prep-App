'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUserOrganization } from '@/lib/supabase/server'

export async function createOverseasActivity(formData: FormData) {
  const supabase = await createClient()
  
  try {
    const { organizationId } = await getCurrentUserOrganization()
    
    const rawData = {
      activity_name: formData.get('activity_name') as string,
      activity_type: formData.get('activity_type') as string,
      country_code: formData.get('country_code') as string,
      partner_id: formData.get('partner_id') as string || null,
      amount: Number(formData.get('amount')),
      currency: formData.get('currency') as string || 'GBP',
      amount_gbp: Number(formData.get('amount_gbp')),
      exchange_rate: formData.get('exchange_rate') ? Number(formData.get('exchange_rate')) : null,
      transfer_method: formData.get('transfer_method') as string,
      transfer_date: formData.get('transfer_date') as string,
      transfer_reference: formData.get('transfer_reference') as string || null,
      financial_year: Number(formData.get('financial_year')),
      quarter: formData.get('quarter') ? Number(formData.get('quarter')) : null,
      beneficiaries_count: formData.get('beneficiaries_count') ? Number(formData.get('beneficiaries_count')) : null,
      project_code: formData.get('project_code') as string || null,
      description: formData.get('description') as string || null,
      sanctions_check_completed: formData.get('sanctions_check_completed') === 'true',
      requires_reporting: formData.get('requires_reporting') === 'true',
      reported_to_commission: formData.get('reported_to_commission') === 'true',
    }

    const { data, error } = await supabase
      .from('overseas_activities')
      .insert({
        ...rawData,
        organization_id: organizationId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating overseas activity:', error)
      return { error: error.message }
    }

    revalidatePath('/compliance/overseas-activities')
    return { data }
  } catch (error) {
    console.error('Error in createOverseasActivity:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create activity' }
  }
}

export async function updateOverseasActivity(id: string, formData: FormData) {
  const supabase = await createClient()
  
  try {
    const rawData = {
      activity_name: formData.get('activity_name') as string,
      activity_type: formData.get('activity_type') as string,
      country_code: formData.get('country_code') as string,
      partner_id: formData.get('partner_id') as string || null,
      amount: Number(formData.get('amount')),
      currency: formData.get('currency') as string || 'GBP',
      amount_gbp: Number(formData.get('amount_gbp')),
      exchange_rate: formData.get('exchange_rate') ? Number(formData.get('exchange_rate')) : null,
      transfer_method: formData.get('transfer_method') as string,
      transfer_date: formData.get('transfer_date') as string,
      transfer_reference: formData.get('transfer_reference') as string || null,
      financial_year: Number(formData.get('financial_year')),
      quarter: formData.get('quarter') ? Number(formData.get('quarter')) : null,
      beneficiaries_count: formData.get('beneficiaries_count') ? Number(formData.get('beneficiaries_count')) : null,
      project_code: formData.get('project_code') as string || null,
      description: formData.get('description') as string || null,
      sanctions_check_completed: formData.get('sanctions_check_completed') === 'true',
      requires_reporting: formData.get('requires_reporting') === 'true',
      reported_to_commission: formData.get('reported_to_commission') === 'true',
    }

    const { data, error } = await supabase
      .from('overseas_activities')
      .update(rawData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating overseas activity:', error)
      return { error: error.message }
    }

    revalidatePath('/compliance/overseas-activities')
    return { data }
  } catch (error) {
    console.error('Error in updateOverseasActivity:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update activity' }
  }
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