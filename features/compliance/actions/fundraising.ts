'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import type { 
  FundraisingActivity,
  CreateFundraisingActivityInput,
  UpdateFundraisingActivityInput
} from '../types/fundraising'
import {
  fetchFundraisingActivities,
  createFundraisingActivityInDb,
  updateFundraisingActivityInDb,
  deleteFundraisingActivityFromDb,
  getUserOrganization
} from '../services/fundraising.service'

/**
 * Server actions for fundraising/income records management
 * These handle authentication and call service functions
 */

export async function getFundraisingActivities(): Promise<FundraisingActivity[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  return fetchFundraisingActivities(organizationId)
}

export async function createFundraisingActivity(data: FormData | CreateFundraisingActivityInput): Promise<{ error?: string; data?: FundraisingActivity }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Parse input based on type
    const input = data instanceof FormData 
      ? {
          source: data.get('source') as CreateFundraisingActivityInput['source'],
          amount: Number(data.get('amount')) || 0,
          date_received: data.get('date_received') as string,
          financial_year: Number(data.get('financial_year')) || new Date().getFullYear(),
          donor_type: data.get('donor_type') as string || null,
          donor_name: data.get('donor_name') as string || null,
          is_anonymous: data.get('is_anonymous') === 'true',
          fundraising_method: data.get('fundraising_method') as string || null,
          campaign_name: data.get('campaign_name') as string || null,
          restricted_funds: data.get('restricted_funds') === 'true',
          restriction_details: data.get('restriction_details') as string || null,
          is_related_party: data.get('is_related_party') === 'true',
          related_party_relationship: data.get('related_party_relationship') as string || null,
          gift_aid_eligible: data.get('gift_aid_eligible') === 'true',
          gift_aid_claimed: data.get('gift_aid_claimed') === 'true',
          reference_number: data.get('reference_number') as string || null,
          notes: data.get('notes') as string || null
        }
      : data

    const { organizationId } = await getUserOrganization(user.id)
    const activity = await createFundraisingActivityInDb(organizationId, input)
    
    revalidateTag('fundraising-activities')
    revalidateTag(`fundraising-activities-${organizationId}`)
    return { data: activity }
  } catch (error) {
    console.error('Create fundraising activity error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create fundraising activity' }
  }
}

export async function updateFundraisingActivity(id: string, data: FormData | Partial<CreateFundraisingActivityInput>): Promise<{ error?: string; data?: FundraisingActivity }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Parse input based on type
    const updates = data instanceof FormData 
      ? {
          source: data.get('source') as CreateFundraisingActivityInput['source'],
          amount: Number(data.get('amount')) || 0,
          date_received: data.get('date_received') as string,
          financial_year: Number(data.get('financial_year')) || new Date().getFullYear(),
          donor_type: data.get('donor_type') as string || null,
          donor_name: data.get('donor_name') as string || null,
          is_anonymous: data.get('is_anonymous') === 'true',
          fundraising_method: data.get('fundraising_method') as string || null,
          campaign_name: data.get('campaign_name') as string || null,
          restricted_funds: data.get('restricted_funds') === 'true',
          restriction_details: data.get('restriction_details') as string || null,
          is_related_party: data.get('is_related_party') === 'true',
          related_party_relationship: data.get('related_party_relationship') as string || null,
          gift_aid_eligible: data.get('gift_aid_eligible') === 'true',
          gift_aid_claimed: data.get('gift_aid_claimed') === 'true',
          reference_number: data.get('reference_number') as string || null,
          notes: data.get('notes') as string || null
        }
      : data

    const input: UpdateFundraisingActivityInput = { id, ...updates }

    const { organizationId } = await getUserOrganization(user.id)
    const activity = await updateFundraisingActivityInDb(organizationId, input)
    
    revalidateTag('fundraising-activities')
    revalidateTag(`fundraising-activities-${organizationId}`)
    return { data: activity }
  } catch (error) {
    console.error('Update fundraising activity error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update fundraising activity' }
  }
}

export async function deleteFundraisingActivity(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  await deleteFundraisingActivityFromDb(organizationId, id)
  
  revalidateTag('fundraising-activities')
  revalidateTag(`fundraising-activities-${organizationId}`)
}

export async function updateRaisedAmount(id: string, amount: number): Promise<FundraisingActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await updateFundraisingActivityInDb(organizationId, { id, amount })
  
  revalidateTag('fundraising-activities')
  revalidateTag(`fundraising-activities-${organizationId}`)
  return activity
}

export async function markComplianceComplete(id: string): Promise<FundraisingActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await updateFundraisingActivityInDb(organizationId, { 
    id, 
    compliance_status: 'compliant' 
  })
  
  revalidateTag('fundraising-activities')
  revalidateTag(`fundraising-activities-${organizationId}`)
  return activity
}