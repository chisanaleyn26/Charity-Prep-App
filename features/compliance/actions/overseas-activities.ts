'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import type { 
  OverseasActivity,
  CreateOverseasActivityInput,
  UpdateOverseasActivityInput
} from '../types/overseas-activities'
import {
  fetchOverseasActivities,
  createOverseasActivityInDb,
  updateOverseasActivityInDb,
  deleteOverseasActivityFromDb,
  getUserOrganization
} from '../services/overseas-activities.service'

/**
 * Server actions for overseas activities management
 * These handle authentication and call service functions
 */

export async function getOverseasActivities(): Promise<OverseasActivity[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  return fetchOverseasActivities(organizationId)
}

export async function createOverseasActivity(data: FormData | CreateOverseasActivityInput): Promise<{ error?: string; data?: OverseasActivity }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Parse input based on type
    const input = data instanceof FormData 
      ? {
          activity_name: (data.get('activity_name') as string)?.trim() || '',
          activity_type: data.get('activity_type') as CreateOverseasActivityInput['activity_type'],
          country_code: (data.get('country_code') as string)?.trim() || '',
          partner_id: (data.get('partner_id') as string)?.trim() || null,
          amount: Number(data.get('amount')) || 0,
          currency: (data.get('currency') as string)?.trim() || 'GBP',
          amount_gbp: Number(data.get('amount_gbp')) || 0,
          exchange_rate: data.get('exchange_rate') && data.get('exchange_rate') !== '' ? Number(data.get('exchange_rate')) : null,
          transfer_method: data.get('transfer_method') as CreateOverseasActivityInput['transfer_method'],
          transfer_date: (data.get('transfer_date') as string)?.trim() || '',
          transfer_reference: (data.get('transfer_reference') as string)?.trim() || null,
          financial_year: Number(data.get('financial_year')) || new Date().getFullYear(),
          quarter: data.get('quarter') && data.get('quarter') !== 'null' && data.get('quarter') !== 'none' ? Number(data.get('quarter')) : null,
          beneficiaries_count: data.get('beneficiaries_count') && data.get('beneficiaries_count') !== '' ? Number(data.get('beneficiaries_count')) : null,
          project_code: (data.get('project_code') as string)?.trim() || null,
          description: (data.get('description') as string)?.trim() || null,
          sanctions_check_completed: data.get('sanctions_check_completed') === 'true' || data.get('sanctions_check_completed') === 'on',
          requires_reporting: data.get('requires_reporting') === 'true' || data.get('requires_reporting') === 'on',
          reported_to_commission: data.get('reported_to_commission') === 'true' || data.get('reported_to_commission') === 'on'
        }
      : data
    

    const { organizationId } = await getUserOrganization(user.id)
    const activity = await createOverseasActivityInDb(organizationId, input)
    
    revalidateTag('overseas-activities')
    revalidateTag(`overseas-activities-${organizationId}`)
    return { data: activity }
  } catch (error) {
    console.error('Create overseas activity error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create overseas activity' }
  }
}

export async function updateOverseasActivity(id: string, data: FormData | Partial<CreateOverseasActivityInput>): Promise<{ error?: string; data?: OverseasActivity }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Parse input based on type
    const updates = data instanceof FormData 
      ? {
          activity_name: data.get('activity_name') as string,
          activity_type: data.get('activity_type') as CreateOverseasActivityInput['activity_type'],
          country_code: data.get('country_code') as string,
          partner_id: data.get('partner_id') as string || null,
          amount: Number(data.get('amount')) || 0,
          currency: data.get('currency') as string || 'GBP',
          amount_gbp: Number(data.get('amount_gbp')) || 0,
          exchange_rate: data.get('exchange_rate') ? Number(data.get('exchange_rate')) : null,
          transfer_method: data.get('transfer_method') as CreateOverseasActivityInput['transfer_method'],
          transfer_date: data.get('transfer_date') as string,
          transfer_reference: data.get('transfer_reference') as string || null,
          financial_year: Number(data.get('financial_year')) || new Date().getFullYear(),
          quarter: data.get('quarter') && data.get('quarter') !== 'null' ? Number(data.get('quarter')) : null,
          beneficiaries_count: data.get('beneficiaries_count') ? Number(data.get('beneficiaries_count')) : null,
          project_code: data.get('project_code') as string || null,
          description: data.get('description') as string || null,
          sanctions_check_completed: data.get('sanctions_check_completed') === 'true',
          requires_reporting: data.get('requires_reporting') === 'true',
          reported_to_commission: data.get('reported_to_commission') === 'true'
        }
      : data

    const input: UpdateOverseasActivityInput = { id, ...updates }

    const { organizationId } = await getUserOrganization(user.id)
    const activity = await updateOverseasActivityInDb(organizationId, input)
    
    revalidateTag('overseas-activities')
    revalidateTag(`overseas-activities-${organizationId}`)
    return { data: activity }
  } catch (error) {
    console.error('Update overseas activity error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update overseas activity' }
  }
}

export async function deleteOverseasActivity(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  await deleteOverseasActivityFromDb(organizationId, id)
  
  revalidateTag('overseas-activities')
  revalidateTag(`overseas-activities-${organizationId}`)
}

export async function updateComplianceStatus(id: string, sanctionsCompleted: boolean, reportingRequired: boolean): Promise<OverseasActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await updateOverseasActivityInDb(organizationId, {
    id,
    sanctions_check_completed: sanctionsCompleted,
    requires_reporting: reportingRequired
  })
  
  revalidateTag('overseas-activities')
  revalidateTag(`overseas-activities-${organizationId}`)
  return activity
}